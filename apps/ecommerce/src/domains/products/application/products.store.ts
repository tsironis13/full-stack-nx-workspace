import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { debounceTime, distinctUntilChanged, pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

import { Product, ProductQuery } from '../domain/public-api';
import { ProductsDataService } from '../data/public-api';

type ProductsState = {
  products: Product[];
  filter: ProductQuery;
};

const initialState: ProductsState = {
  products: [],
  filter: { page: 1, limit: 10 },
};

export const ProductsStore = signalStore(
  withState(initialState),
  withMethods((store, productsService = inject(ProductsDataService)) => ({
    getProductsPaginatedFilteredBy: rxMethod<ProductQuery>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          return productsService.getPaginatedFilteredBy(query).pipe(
            tapResponse({
              next: (products) => patchState(store, { products }),
              error: (err) => {
                patchState(store, { products: [] });
                console.error(err);
              },
            })
          );
        })
      )
    ),
  }))
);
