import { ProductsDataService } from '../data/public-api';
import { ProductsApiService } from '../infrastructure/public-api';
import { ProductsStore, ProductsFacade } from '../application/public-api';

export default [
  {
    path: '',
    providers: [
      ProductsDataService,
      ProductsApiService,
      ProductsStore,
      ProductsFacade,
    ],
    loadComponent: () =>
      import('../feat-catalog/products-catalog.page').then(
        (m) => m.ProductsCatalogPage
      ),
  },
];
