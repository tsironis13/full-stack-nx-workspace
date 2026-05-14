import { emptyCartGuard } from '../application/public-api';

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
    loadComponent: () =>
      import('../feat-checkout/checkout-confirmation/checkout-confirmation.component').then(
        (m) => m.CheckoutConfirmationComponent,
      ),
  },
];
