import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ProductsCatalogPostDto,
  ProductCatalogFilterDto,
  ProductsCatalogFiltersPostDto,
  ProductsCatalogDto,
} from './products.api.model';

@Injectable()
export class ProductsApiService {
  readonly #http = inject(HttpClient);

  public getPaginatedProductsCatalogFilteredBy(
    productsCatalogPostDto: ProductsCatalogPostDto
  ): Observable<ProductsCatalogDto> {
    return this.#http.post<ProductsCatalogDto>(
      `/api/products/catalog/paginated`,
      productsCatalogPostDto
    );
  }

  public getProductsCatalogFilters(
    productsCatalogFiltersPostDto: ProductsCatalogFiltersPostDto
  ): Observable<ProductCatalogFilterDto[]> {
    return this.#http.post<ProductCatalogFilterDto[]>(
      `/api/products/catalog/filters`,
      productsCatalogFiltersPostDto
    );
  }
}
