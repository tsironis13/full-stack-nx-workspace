import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SUPABASE_STRATEGY } from '../strategy/supabase.strategy';

@Injectable()
export class SupabaseAuthGuard extends AuthGuard(SUPABASE_STRATEGY) {
  override canActivate(context: ExecutionContext) {
    console.log(context);
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  override handleRequest(err: unknown, user: any, info: unknown) {
    console.log(err, user, info);
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
