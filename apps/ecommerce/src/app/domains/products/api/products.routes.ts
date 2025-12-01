import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';

import { ProductsDataService } from '../data/public-api';
import { ProductsApiService } from '../infrastructure/public-api';
import { ProductsCatalogStore } from '../application/public-api';

export const catelogResolver: ResolveFn<void> = (
  route: ActivatedRouteSnapshot
) => {
  const productsCatalogStore = inject(ProductsCatalogStore);
  const categoryId = route.paramMap.get('categoryId');

  if (categoryId) {
    productsCatalogStore.setCategoryId(parseInt(categoryId));
  }
};

export default [
  {
    path: ':categoryId/catalog',
    providers: [ProductsDataService, ProductsApiService, ProductsCatalogStore],
    loadComponent: () =>
      import('../feat-catalog/products-catalog.page').then(
        (m) => m.ProductsCatalogPage
      ),
    resolve: {
      catalog: catelogResolver,
    },
  },
];
