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
import { distinctUntilChanged, filter, pipe, skip, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { Dispatcher } from '@ngrx/signals/events';

import { ProductsDataService } from '../data/public-api';
import {
  addItemToCart,
  removeItemFromCart,
} from '../../cart/application/anti-corruption-layer';
import {
  ProductFiltersForm,
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
  filtersForm: ProductFiltersForm | null; // used as view model for the filters form
};

const initialState: ProductsCatalogState = {
  products: [],
  productFilters: [],
  filterQuery: {
    page: 1,
    limit: 10,
    categoryId: null,
    filters: null,
  },
  filtersForm: null,
};

export const ProductsCatalogStore = signalStore(
  withState(initialState),
  withProps(() => ({
    productsService: inject(ProductsDataService),
    dispatcher: inject(Dispatcher),
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
        skip(1),
        switchMap((query) => {
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
    getProductFilters: rxMethod<number | null>(
      pipe(
        filter((categoryId) => categoryId !== null),
        switchMap((categoryId: number) => {
          return store.productsService
            .getProductsCatalogFilters(categoryId)
            .pipe(
              distinctUntilChanged(),
              tapResponse({
                next: (response) => {
                  const productFilters = response.map((productFilter) =>
                    productCatalogFilterToProductCatalogFilterViewModel(
                      productFilter
                    )
                  );

                  return patchState(store, {
                    productFilters,
                    filtersForm: buildProductFiltersForm(productFilters),
                  });
                },
                error: (err) => {
                  patchState(store, { productFilters: [] });
                  console.error(err);
                },
              })
            );
        })
      )
    ),
    onProductFiltersFormChange: rxMethod<ProductFiltersForm | null>(
      pipe(
        filter((filters) => filters !== null),
        tap((filters) => {
          console.log('filters', filters);
          if (filters !== null) {
            const filtersArray = Object.entries(filters).map(
              ([key, value]) => ({
                attributeId: parseInt(key),
                values: (Array.isArray(value) ? value : [value]) as number[],
              })
            );
            patchState(store, {
              filterQuery: {
                ...store.filterQuery(),
                filters: filtersArray,
              },
            });
          }
        })
      )
    ),
    setCategoryId: (categoryId: number) => {
      patchState(store, {
        filterQuery: {
          ...store.filterQuery(),
          categoryId: categoryId,
        },
      });
    },
    changePage: (page: number) => {
      patchState(store, {
        filterQuery: {
          ...store.filterQuery(),
          page: page,
        },
      });
    },
  })),
  withHooks((store) => ({
    onInit: () => {
      const productQuery = store.filterQuery;

      store.getPaginatedProductsCatalogFilteredBy(productQuery);

      store.getProductFilters(productQuery.categoryId);

      store.onProductFiltersFormChange(store.filtersForm);
    },
  }))
);

const buildProductFiltersForm = (
  productFilters: ProductFilterViewModel[]
): ProductFiltersForm => {
  const filters: ProductFiltersForm = {};

  for (const attr of productFilters) {
    switch (attr.inputType) {
      case 'checkbox':
        filters[attr.attributeId] = [];
        break;
      case 'select':
        filters[attr.attributeId] = null;
        break;

      case 'radio':
        filters[attr.attributeId] = [];
        break;

      default:
        filters[attr.attributeId] = null;
        break;
    }
  }
  return filters;
};
