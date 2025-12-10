import { loginGuard } from '@full-stack-nx-workspace/auth-web';

export default [
  {
    path: '',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./login.component').then((m) => m.LoginComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
