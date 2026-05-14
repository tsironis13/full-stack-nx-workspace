import { checkoutSuccessGuard, emptyCartGuard } from '../application/public-api';

export default [
  {
    path: '',
    canActivate: [emptyCartGuard],
    loadComponent: () =>
      import('../feat-checkout/checkout-page.component').then(
        (m) => m.CheckoutPageComponent,
      ),
  },
  {
    path: 'confirmation',
    canActivate: [checkoutSuccessGuard],
    loadComponent: () =>
      import('../feat-checkout/checkout-confirmation/checkout-confirmation.component').then(
        (m) => m.CheckoutConfirmationComponent,
      ),
  },
];
