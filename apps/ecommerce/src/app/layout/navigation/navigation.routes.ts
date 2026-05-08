import { NavigationComponent } from './navigation.component';

export default [
  {
    path: '',
    component: NavigationComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
