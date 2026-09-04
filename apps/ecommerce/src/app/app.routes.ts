import { Route } from '@angular/router';
import { inject } from '@angular/core';

import { ShoppingChatService } from './core/public-api';
import { shoppingAgentWidgets } from './domains/shopping/api/shopping.routes';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadChildren: () => import('./layout/login/login.routes'),
  },
  {
    path: '',
    resolve: {
      shoppingChatService: () =>
        inject(ShoppingChatService).init({ widgets: shoppingAgentWidgets }),
    },
    loadChildren: () => import('./layout/navigation/navigation.routes'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
