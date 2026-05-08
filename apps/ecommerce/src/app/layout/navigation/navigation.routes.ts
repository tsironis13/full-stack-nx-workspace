import { NavigationComponent } from './navigation.component';

export default [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: 'catalog',
        loadChildren: () =>
          import('../../domains/catalog/api/catalog.routes').then(
            (m) => m.default
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'catalog',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
