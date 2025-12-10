import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadChildren: () => import('./layout/login/login.routes'),
  },
  {
    path: '',
    loadChildren: () => import('./layout/navigation/navigation.routes'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
