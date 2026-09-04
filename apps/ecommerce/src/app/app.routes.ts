import { Route } from '@angular/router';
import { inject } from '@angular/core';

import { ShoppingChatService } from './core/public-api';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadChildren: () => import('./layout/login/login.routes'),
  },
  {
    path: '',
    resolve: {
      shoppingChatService: () => inject(ShoppingChatService).init(),
    },
    loadChildren: () => import('./layout/navigation/navigation.routes'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
