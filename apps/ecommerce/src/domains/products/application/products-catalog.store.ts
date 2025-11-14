import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { Dispatcher } from '@ngrx/signals/events';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { ProductsDataService } from '../data/public-api';
import {
  addItemToCart,
  removeItemFromCart,
} from '../../cart/application/anti-corruption-layer';
import {
  ProductFiltersQueryViewModel,
  ProductFilterViewModel,
  ProductQueryViewModel,
  ProductViewModel,
} from './view-models/view.model';
import {
  productCatalogFilterToProductCatalogFilterViewModel,
  productToProductViewModel,
} from './view-models/view-model.mapper';

type ProductsCatalogState = {
  products: ProductViewModel[]; // list of products to display in the catalog
  productFilters: ProductFilterViewModel[]; //list of filters by attributes (width (cm), height (cm), etc. used to filter products)
  filterQuery: ProductQueryViewModel; // query to get the products catalog (page, limit, filters)
  productFiltersForm: FormGroup;
};

const initialState: ProductsCatalogState = {
  products: [],
  filterQuery: {
    page: 1,
    limit: 10,
    filters: {
      categoryId: 434,
      filter: null,
    },
  },
  productFilters: [],
  productFiltersForm: new FormGroup({
    categoryId: new FormControl(434),
  }),
};

export const ProductsCatalogStore = signalStore(
  withState(initialState),
  withProps(() => ({
    productsService: inject(ProductsDataService),
    dispatcher: inject(Dispatcher),
    fb: inject(FormBuilder),
  })),
  withMethods((store) => ({
    addItemToCart: (productId: number) => {
      patchState(store, {
        products: store
          .products()
          .map((product) =>
            product.id === productId
              ? { ...product, quantity: product.quantity + 1 }
              : product
          ),
      });
      store.dispatcher.dispatch(addItemToCart(productId));
    },
    removeItemFromCart: (productId: number) => {
      patchState(store, {
        products: store
          .products()
          .map((product) =>
            product.id === productId && product.quantity > 0
              ? { ...product, quantity: product.quantity - 1 }
              : product
          ),
      });
      store.dispatcher.dispatch(removeItemFromCart(productId));
    },
    getPaginatedProductsCatalogFilteredBy: rxMethod<ProductQueryViewModel>(
      pipe(
        distinctUntilChanged(),
        switchMap((query) => {
          console.log(query);
          return store.productsService
            .getPaginatedProductsCatalogFilteredBy(query)
            .pipe(
              tapResponse({
                next: (products) =>
                  patchState(store, {
                    products: products.map((product) =>
                      productToProductViewModel(product, 0)
                    ),
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
    getProductFilters: rxMethod<ProductFiltersQueryViewModel>(
      pipe(
        tap((query) => {
          console.log(query);
        }),
        switchMap((query) => {
          return store.productsService.getProductsCatalogFilters(query).pipe(
            tapResponse({
              next: (productFilters) =>
                patchState(store, {
                  productFilters: productFilters.map((productFilter) =>
                    productCatalogFilterToProductCatalogFilterViewModel(
                      productFilter
                    )
                  ),
                }),
              error: (err) => {
                patchState(store, { productFilters: [] });
                console.error(err);
              },
            })
          );
        })
      )
    ),
    buildProductFiltersForm: rxMethod<ProductFilterViewModel[]>(
      pipe(
        tap((productFilters) => {
          console.log(productFilters);
          console.log(productFilters);
          const group: Record<string, FormControl | FormArray> = {};

          for (const attr of productFilters) {
            switch (attr.inputType) {
              case 'checkbox':
                group[attr.attributeName] = store.fb.control([]);
                break;
              case 'select':
                group[attr.attributeName] = new FormControl(null);
                break;

              case 'radio':
                group[attr.attributeName] = store.fb.control(null);
                break;

              default:
                group[attr.attributeName] = new FormControl(null);
                break;
            }
          }
          patchState(store, { productFiltersForm: store.fb.group(group) });
        })
      )
    ),
    update: (filterQuery: ProductQueryViewModel) => {
      console.log('update');

      patchState(store, {
        productFiltersForm: store.fb.group({
          ...store.productFiltersForm(),
          ...filterQuery.filters,
        }),
      });
    },
  })),
  withHooks((store) => ({
    onInit: () => {
      const productQuery = store.filterQuery;
      console.log(productQuery());
      store.getPaginatedProductsCatalogFilteredBy(productQuery);

      const productFiltersQuery = store.filterQuery().filters;
      console.log(productFiltersQuery);
      if (productFiltersQuery) {
        //store.getProductFilters(productFiltersQuery);
      }

      store.getProductFilters(store.productFiltersForm().valueChanges);

      store.productFiltersForm().patchValue({
        categoryId: 434,
      });

      store.buildProductFiltersForm(store.productFilters);

      console.log('products catalog filters store initialized');
    },
  }))
);
