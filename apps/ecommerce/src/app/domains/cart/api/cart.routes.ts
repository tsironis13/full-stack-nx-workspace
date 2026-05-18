import type { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('../feat-cart/cart-page.component').then(
        (m) => m.CartPageComponent,
      ),
  },
] satisfies Routes;
