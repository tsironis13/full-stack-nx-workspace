import type { Routes } from '@angular/router';

import { ProductDetailStore } from '../application/public-api';

export default [
  {
    path: ':id',
    loadComponent: () =>
      import('../feat-detail/product-detail.page').then(
        (m) => m.ProductDetailPageComponent,
      ),
    providers: [ProductDetailStore],
  },
] satisfies Routes;
