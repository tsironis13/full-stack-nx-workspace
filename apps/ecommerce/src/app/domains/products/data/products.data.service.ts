import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ProductsApiService } from '../infrastructure/public-api';
import {
  productCatalogFilterDtoToProductCatalogFilterModel,
  productCatalogFiltersQueryModelToProductsCatalogFiltersPostDto,
  productCatalogQueryModelToProductCatalogPostDto,
  productDtoToProductModel,
} from './products.mapper';
import {
  ProductsCatalog,
  ProductCatalogFilter,
  ProductCatalogQuery,
  ProductCatalogFiltersQuery,
} from '../domain/public-api';

@Injectable()
export class ProductsDataService {
  readonly #productsApiService = inject(ProductsApiService);

  public getPaginatedProductsCatalogFilteredBy(
    productCatalogQuery: ProductCatalogQuery
  ): Observable<ProductsCatalog> {
    return this.#productsApiService
      .getPaginatedProductsCatalogFilteredBy(
        productCatalogQueryModelToProductCatalogPostDto(productCatalogQuery)
      )
      .pipe(
        map((productsCatalogDto) => {
          return {
            products: productsCatalogDto.products.map(productDtoToProductModel),
            totalResults: productsCatalogDto.totalResults,
          };
        })
      );
  }

  public getProductsCatalogFilters(
    productCatalogFiltersQuery: ProductCatalogFiltersQuery
  ): Observable<ProductCatalogFilter[]> {
    return this.#productsApiService
      .getProductsCatalogFilters(
        productCatalogFiltersQueryModelToProductsCatalogFiltersPostDto(
          productCatalogFiltersQuery.categoryId,
          productCatalogFiltersQuery.priceRange
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
