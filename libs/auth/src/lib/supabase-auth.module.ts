import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SupabaseStrategy } from './strategy/supabase.strategy';

@Module({
  imports: [PassportModule],
  providers: [
    // AuthResolver,
    SupabaseStrategy,
  ],
  exports: [SupabaseStrategy],
})
export class SupabaseAuthModule {}
