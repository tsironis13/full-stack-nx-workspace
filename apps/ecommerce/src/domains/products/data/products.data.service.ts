import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ProductsApiService } from '../infrastructure/public-api';
import {
  productCatalogFilterDtoToProductCatalogFilterModel,
  productCatalogFiltersQueryModelToProductCatalogFiltersPostDto,
  productCatalogQueryModelToProductCatalogPostDto,
  productDtoToProductModel,
} from './products.mapper';
import {
  Product,
  ProductCatalogFilter,
  ProductCatalogFiltersQuery,
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
    productCatalogFiltersQuery: ProductCatalogFiltersQuery
  ): Observable<ProductCatalogFilter[]> {
    return this.#productsApiService
      .getProductsCatalogFilters(
        productCatalogFiltersQueryModelToProductCatalogFiltersPostDto(
          productCatalogFiltersQuery
        )
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
