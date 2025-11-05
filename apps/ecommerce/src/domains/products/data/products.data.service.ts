import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductsApiService } from '../infrastructure/public-api';
import { ProductDataModel, ProductsPostDataModel } from './products.data.model';

@Injectable()
export class ProductsDataService {
  readonly #productsApiService = inject(ProductsApiService);

  public getPaginatedFilteredBy(
    productsPostDataModel: ProductsPostDataModel
  ): Observable<ProductDataModel[]> {
    return this.#productsApiService.getPaginatedFilteredBy(
      productsPostDataModel
    );
  }
}
