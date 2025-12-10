import { Module } from '@nestjs/common';

import { SupabaseAuthModule } from '@full-stack-nx-workspace/auth';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [SupabaseAuthModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
