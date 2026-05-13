import { NavigationComponent } from './navigation.component';

export default [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: 'catalog',
        loadChildren: () => import('../../domains/catalog/api/catalog.routes'),
      },
      {
        path: 'cart',
        loadChildren: () => import('../../domains/cart/api/cart.routes'),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
