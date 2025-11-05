import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductsPostDto, ProductDto } from './products.api.model';

@Injectable()
export class ProductsApiService {
  readonly #http = inject(HttpClient);

  public getPaginatedFilteredBy(
    productsPostDto: ProductsPostDto
  ): Observable<ProductDto[]> {
    return this.#http.post<ProductDto[]>(
      `/api/products/paginated`,
      productsPostDto
    );
  }
}
