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
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
