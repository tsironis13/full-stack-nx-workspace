import { ProductsDataService } from '../data/public-api';
import { ProductsApiService } from '../infrastructure/public-api';
import { ProductsCatalogStore } from '../application/public-api';

export default [
  {
    path: '',
    providers: [ProductsDataService, ProductsApiService, ProductsCatalogStore],
    loadComponent: () =>
      import('../feat-catalog/products-catalog.page').then(
        (m) => m.ProductsCatalogPage
      ),
  },
];
