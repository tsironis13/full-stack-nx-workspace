import { NavigationComponent } from './navigation.component';

export default [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: 'products',
        loadChildren: () =>
          import('../../domains/products/api/products.routes'),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
