import { Injectable } from '@nestjs/common';
import { AuthTokenResponsePassword } from '@supabase/supabase-js';

import { LoginPostDto } from './dto/login.post.dto';
import { SupabaseStrategy } from '@full-stack-nx-workspace/auth';

@Injectable()
export class AuthService {
  constructor(private supabaseStrategy: SupabaseStrategy) {}

  login(loginPostDto: LoginPostDto): Promise<AuthTokenResponsePassword> {
    return this.supabaseStrategy.signIn(
      loginPostDto.email,
      loginPostDto.password
    );
  }
}
