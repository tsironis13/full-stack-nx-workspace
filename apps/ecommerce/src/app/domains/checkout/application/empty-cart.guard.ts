import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { CartAclReadAdapter } from '../../cart/application/anti-corruption-layer';

/**
 * Prevents navigation to `/checkout` when the cart is empty **or** when any
 * Cart Item is unavailable (archived product). Redirects to `/cart` so the
 * user can review and clean up their basket before proceeding.
 *
 * Guest Cart items (no `available` field) are treated as available and do not
 * trigger the unavailability redirect.
 *
 * Placed in `application/` (not `api/`) so it can legally import the
 * Cart bounded-context's ACL (`domain-application-anti-corruption-layer-api`),
 * which `domain-routes` cannot import directly.
 */
export const emptyCartGuard: CanActivateFn = () => {
  const cartAcl = inject(CartAclReadAdapter);
  const redirect = inject(Router).createUrlTree(['/cart']);
  if (cartAcl.items().length === 0 || cartAcl.hasUnavailableItems()) {
    return redirect;
  }
  return true;
};
