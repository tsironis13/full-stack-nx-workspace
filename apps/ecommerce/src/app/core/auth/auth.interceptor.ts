import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStore } from '@full-stack-nx-workspace/auth-web';
import { REQUIRES_AUTH } from './requires-auth.context';

/**
 * Attaches a Bearer token to outgoing requests that explicitly opt in via
 * the {@link REQUIRES_AUTH} context token. Requests without the token, or
 * requests where no session exists, are forwarded unchanged.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(REQUIRES_AUTH)) {
    return next(req);
  }

  const accessToken = inject(AuthStore).session()?.accessToken;

  if (!accessToken) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    }),
  );
};
