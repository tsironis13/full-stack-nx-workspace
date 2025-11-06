import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ProductsApiService } from '../infrastructure/public-api';
import {
  productQueryModelToProductPostDto,
  productDtoToProductModel,
} from './products.mapper';
import { ProductQuery, Product } from '../domain/public-api';

@Injectable()
export class ProductsDataService {
  readonly #productsApiService = inject(ProductsApiService);

  public getPaginatedFilteredBy(
    productQuery: ProductQuery
  ): Observable<Product[]> {
    return this.#productsApiService
      .getPaginatedFilteredBy(productQueryModelToProductPostDto(productQuery))
      .pipe(map((products) => products.map(productDtoToProductModel)));
  }
}
