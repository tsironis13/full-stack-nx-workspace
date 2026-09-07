import { Route } from '@angular/router';

import { initShoppingAssistant } from './domains/shopping/api/shopping.routes';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadChildren: () => import('./layout/login/login.routes'),
  },
  {
    path: '',
    resolve: {
      shoppingAssistant: () => {
        initShoppingAssistant();
      },
    },
    loadChildren: () => import('./layout/navigation/navigation.routes'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
