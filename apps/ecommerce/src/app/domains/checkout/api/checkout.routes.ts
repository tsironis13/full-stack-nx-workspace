import { emptyCartGuard } from '../application/public-api';

export default [
  {
    path: '',
    canActivate: [emptyCartGuard],
    loadComponent: () =>
      import('../feat-checkout/checkout-page.component').then(
        (m) => m.CheckoutPageComponent
      ),
  },
];
