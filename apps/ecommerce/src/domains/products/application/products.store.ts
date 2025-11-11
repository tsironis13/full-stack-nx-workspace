import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { debounceTime, distinctUntilChanged, pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { Dispatcher } from '@ngrx/signals/events';

import { Product, ProductQuery } from '../domain/public-api';
import { ProductsDataService } from '../data/public-api';
import {
  addItemToCart,
  removeItemFromCart,
} from '../../cart/application/anti-corruption-layer';

type ProductsState = {
  products: { item: Product; quantity: number }[]; // quantity refers to the product quantity in the cart
  filter: ProductQuery;
};

const initialState: ProductsState = {
  products: [],
  filter: { page: 1, limit: 10 },
};

export const ProductsStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      productsService = inject(ProductsDataService),
      dispatcher = inject(Dispatcher)
    ) => ({
      addItemToCart: (productId: number) => {
        patchState(store, {
          products: store
            .products()
            .map((product) =>
              product.item.id === productId
                ? { ...product, quantity: product.quantity + 1 }
                : product
            ),
        });
        dispatcher.dispatch(addItemToCart(productId));
      },
      removeItemFromCart: (productId: number) => {
        patchState(store, {
          products: store
            .products()
            .map((product) =>
              product.item.id === productId && product.quantity > 0
                ? { ...product, quantity: product.quantity - 1 }
                : product
            ),
        });
        dispatcher.dispatch(removeItemFromCart(productId));
      },
      getProductsPaginatedFilteredBy: rxMethod<ProductQuery>(
        pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((query) => {
            return productsService.getPaginatedFilteredBy(query).pipe(
              tapResponse({
                next: (products) =>
                  patchState(store, {
                    products: products.map((product) => ({
                      item: product,
                      quantity: 0,
                    })),
                  }),
                error: (err) => {
                  patchState(store, { products: [] });
                  console.error(err);
                },
              })
            );
          })
        )
      ),
    })
  )
);
