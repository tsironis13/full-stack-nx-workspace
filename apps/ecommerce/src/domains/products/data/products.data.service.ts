import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ProductsApiService } from '../infrastructure/public-api';
import {
  categoryIdToProductsCatalogFiltersPostDto,
  productCatalogFilterDtoToProductCatalogFilterModel,
  productCatalogQueryModelToProductCatalogPostDto,
  productDtoToProductModel,
} from './products.mapper';
import {
  Product,
  ProductCatalogFilter,
  ProductCatalogQuery,
} from '../domain/public-api';

@Injectable()
export class ProductsDataService {
  readonly #productsApiService = inject(ProductsApiService);

  public getPaginatedProductsCatalogFilteredBy(
    productCatalogQuery: ProductCatalogQuery
  ): Observable<Product[]> {
    return this.#productsApiService
      .getPaginatedProductsCatalogFilteredBy(
        productCatalogQueryModelToProductCatalogPostDto(productCatalogQuery)
      )
      .pipe(map((products) => products.map(productDtoToProductModel)));
  }

  public getProductsCatalogFilters(
    categoryId: number
  ): Observable<ProductCatalogFilter[]> {
    return this.#productsApiService
      .getProductsCatalogFilters(
        categoryIdToProductsCatalogFiltersPostDto(categoryId)
      )
      .pipe(
        map((productCatalogFilters) =>
          productCatalogFilters.map(
            productCatalogFilterDtoToProductCatalogFilterModel
          )
        )
      );
  }
}
