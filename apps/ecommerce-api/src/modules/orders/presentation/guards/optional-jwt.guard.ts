import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const SUPABASE_STRATEGY = 'SUPABASE';

/**
 * Authenticates the request when a Bearer token is present but does NOT
 * reject requests that carry no token. This lets guest checkouts through
 * while still populating `req.user` for authenticated shoppers.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard(SUPABASE_STRATEGY) {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest(_err: unknown, user: any) {
    return user ?? null;
  }
}
