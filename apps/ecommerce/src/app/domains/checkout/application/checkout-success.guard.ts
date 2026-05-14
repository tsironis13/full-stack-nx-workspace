import { inject } from '@angular/core';
import { type CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { CheckoutStore } from './checkout.store';

/**
 * Prevents direct navigation to `/checkout/confirmation` when the checkout
 * has not completed successfully. Redirects to `/catalog` in that case.
 */
export const checkoutSuccessGuard: CanActivateFn = () => {
  const store = inject(CheckoutStore);
  if (!store.isSuccess()) {
    return inject(Router).createUrlTree(['/catalog']);
  }
  return true;
};
