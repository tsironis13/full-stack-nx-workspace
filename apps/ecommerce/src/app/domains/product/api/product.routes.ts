import type { Routes } from '@angular/router';

import {
  ProductDetailStore,
  ReviewSubmissionStore,
} from '../application/public-api';

export default [
  {
    path: ':id',
    loadComponent: () =>
      import('../feat-detail/product-detail.page').then(
        (m) => m.ProductDetailPageComponent,
      ),
    providers: [ProductDetailStore, ReviewSubmissionStore],
  },
] satisfies Routes;
