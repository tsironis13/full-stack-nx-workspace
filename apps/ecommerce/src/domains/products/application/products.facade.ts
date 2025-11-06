import { computed, inject, Injectable } from '@angular/core';

import { ProductsStore } from './products.store';
import { Product, ProductQuery } from '../domain/public-api';
import { ProductViewModel } from './view-models/product.view.model';

/**
 * Facade for the products domain
 * Provides the bridge between the UI layer and the application/domain layer
 * All mapping between the UI layer and the application/domain layer should be done here.
 *
 * Application layer contains UI view models and the domain layer contains the business logic and the data layer contains the data access logic.
 */
@Injectable()
export class ProductsFacade {
  readonly #productsStore = inject(ProductsStore);

  public readonly products = computed<ProductViewModel[]>(() =>
    this.#productsStore.products().map((product: Product) => ({
      name: product.name,
      image: {
        path: product.imageUrl,
        priority: false,
        width: 300,
        height: 300,
      },
    }))
  );

  public getProductsPaginatedFilteredBy(query: ProductQuery): void {
    this.#productsStore.getProductsPaginatedFilteredBy(query);
  }
}
