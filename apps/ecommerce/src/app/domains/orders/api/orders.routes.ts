import type { Routes } from '@angular/router';

import { authGuard } from '@full-stack-nx-workspace/auth-web';

import { OrderHistoryStore } from '../application/public-api';

export default [
  {
    path: '',
    canActivate: [authGuard],
    providers: [OrderHistoryStore],
    loadComponent: () =>
      import('../feat-history/order-history.page').then(
        (m) => m.OrderHistoryPageComponent,
      ),
  },
] satisfies Routes;
