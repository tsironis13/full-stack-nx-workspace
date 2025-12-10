import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthTokenResponsePassword } from '@supabase/supabase-js';

import { AuthService } from './auth.service';
import { LoginPostDto } from './dto/login.post.dto';
import { SupabaseAuthGuard } from '@full-stack-nx-workspace/auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() req: LoginPostDto): Promise<AuthTokenResponsePassword> {
    return this.authService.login(req);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
