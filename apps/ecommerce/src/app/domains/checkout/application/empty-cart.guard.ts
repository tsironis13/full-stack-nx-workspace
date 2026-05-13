import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { CartAclReadAdapter } from '../../cart/application/anti-corruption-layer';

/**
 * Prevents navigation to `/checkout` when the cart is empty.
 * Redirects to `/cart` so the user can review their basket first.
 *
 * Placed in `application/` (not `api/`) so it can legally import the
 * Cart bounded-context's ACL (`domain-application-anti-corruption-layer-api`),
 * which `domain-routes` cannot import directly.
 */
export const emptyCartGuard: CanActivateFn = () => {
  const cartAcl = inject(CartAclReadAdapter);
  if (cartAcl.items().length === 0) {
    return inject(Router).createUrlTree(['/cart']);
  }
  return true;
};
