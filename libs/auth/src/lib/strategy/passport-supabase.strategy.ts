import { Request } from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';
import { Strategy } from 'passport-strategy';
import {
  AuthTokenResponsePassword,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { HttpException, HttpStatus } from '@nestjs/common';

import { SupabaseAuthStrategyOptions } from '../interface/options';
import { SupabaseAuthUser } from '../interface/user';

const UNAUTHORIZED = 'Unauthorized';

export class SupabaseAuthStrategy extends Strategy {
  private readonly supabase: SupabaseClient | null = null;
  private readonly extractor: JwtFromRequestFunction | null = null;

  constructor(options: SupabaseAuthStrategyOptions) {
    super();
    if (!options.extractor) {
      throw new Error(
        '\n Extractor is not a function. You should provide an extractor. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme'
      );
    }

    this.supabase = createClient(
      options.supabaseUrl,
      options.supabaseKey,
      (options.supabaseOptions = {})
    );
    this.extractor = options.extractor;
  }

  override authenticate(req: Request): void {
    if (!this.extractor) {
      throw new Error(
        'Extractor is not a function. You should provide an extractor. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme'
      );
    }

    if (!this.supabase) {
      throw new Error(
        'Supabase client is not initialized. You should provide a supabase client. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme'
      );
    }

    const idToken = this.extractor(req);

    if (!idToken) {
      this.fail(UNAUTHORIZED, 401);
      return;
    }

    this.supabase.auth
      .getUser(idToken)
      .then(({ data: { user } }) => this.validate(user))
      .catch((err) => {
        this.fail(err.message, 401);
      });
  }

  async signIn(
    email: string,
    password: string
  ): Promise<AuthTokenResponsePassword> {
    if (!this.supabase) {
      throw new Error(
        'Supabase client is not initialized. You should provide a supabase client. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme'
      );
    }

    const res = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (res.error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return res;
  }

  async validate(
    payload: SupabaseAuthUser | null
  ): Promise<SupabaseAuthUser | null> {
    if (!payload) {
      this.fail(UNAUTHORIZED, 401);
      return null;
    }

    this.success(payload, {});

    return payload;
  }
}
