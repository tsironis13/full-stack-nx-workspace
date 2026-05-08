import type { Routes } from '@angular/router';

import { CatalogBrowseStore } from '../application/public-api';

export default [
  {
    path: '',
    loadComponent: () =>
      import('../feat-browse/catalog-browse.page').then(
        (m) => m.CatalogBrowsePageComponent
      ),
    providers: [CatalogBrowseStore],
  },
] satisfies Routes;
