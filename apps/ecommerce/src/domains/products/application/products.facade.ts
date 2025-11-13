import { computed, effect, inject, Injectable } from '@angular/core';

import { ProductsStore } from './products.store';
import { Product, ProductQuery } from '../domain/public-api';
import { ProductViewModel } from './view-models/product.view.model';
import { CategoriesUiAdapter } from '../../../domains/categories/application/anti-corruption-layer';

const productToProductViewModel = (
  product: Product,
  quantity: number
): ProductViewModel => {
  return {
    id: product.id,
    name: product.name,
    image: {
      path: product.imageUrl,
      priority: false,
      fill: true,
    },
    originalPrice: product.originalPrice,
    salePrice: product.salePrice,
    quantity: quantity,
  };
};

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
  readonly #categoriesUiAdapter = inject(CategoriesUiAdapter);

  c = effect(() => {
    console.log(this.#categoriesUiAdapter.categoryFilters());
  });

  public readonly productsViewModel = computed<ProductViewModel[]>(() =>
    this.#productsStore
      .products()
      .map((product: { item: Product; quantity: number }) =>
        productToProductViewModel(product.item, product.quantity)
      )
  );

  public getProductCategoryFilters(categoryId: number): void {
    this.#categoriesUiAdapter.getCategoryFiltersGroupedByAttributeValuesById(
      categoryId
    );
  }

  public getProductsPaginatedFilteredBy(query: ProductQuery): void {
    this.#productsStore.getProductsPaginatedFilteredBy(query);
  }

  public removeItemFromCart(id: number): void {
    this.#productsStore.removeItemFromCart(id);
  }

  public addItemToCart(id: number): void {
    this.#productsStore.addItemToCart(id);
  }
}
