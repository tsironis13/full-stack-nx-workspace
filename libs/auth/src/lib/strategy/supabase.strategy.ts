import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { AuthTokenResponsePassword } from '@supabase/supabase-js';

import { SupabaseAuthStrategy } from './passport-supabase.strategy';
import { SupabaseAuthUser } from '../interface/user';

export const SUPABASE_STRATEGY = 'SUPABASE';
const SUPABASE_AUTH_URL = 'SUPABASE_AUTH_URL';
const SUPABASE_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  SUPABASE_STRATEGY
) {
  public constructor() {
    super({
      supabaseUrl: process.env[SUPABASE_AUTH_URL] as string,
      supabaseKey: process.env[SUPABASE_KEY] as string,
      supabaseOptions: {},
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: SupabaseAuthUser): Promise<SupabaseAuthUser | null> {
    return await super.validate(payload);
  }

  override authenticate(req: Request): void {
    super.authenticate(req);
  }

  override signIn(
    email: string,
    password: string
  ): Promise<AuthTokenResponsePassword> {
    return super.signIn(email, password);
  }
}
