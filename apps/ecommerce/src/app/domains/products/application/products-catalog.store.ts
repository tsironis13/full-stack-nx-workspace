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
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { Dispatcher } from '@ngrx/signals/events';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';

import { ProductsDataService } from '../data/public-api';
import {
  addItemToCart,
  removeItemFromCart,
} from '../../cart/application/anti-corruption-layer';
import {
  DynamicFields,
  PriceRangeViewModel,
  ProductFiltersForm,
  ProductFilterViewModel,
  ProductQueryViewModel,
  ProductViewModel,
} from './view-models/view.model';
import {
  productCatalogFilterToProductCatalogFilterViewModel,
  productToProductViewModel,
} from './view-models/view-model.mapper';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '../../../core/public-api';

const maxPrice = 200;
const minPrice = 0;

type ProductsCatalogState = {
  products: ProductViewModel[]; // list of products to display in the catalog
  totalResults: number;
  totalItemsPerPageOptions: number[];
  productFilters: ProductFilterViewModel[]; //list of filters by attributes (width (cm), height (cm), etc. used to filter products)
  filterQuery: ProductQueryViewModel; // query to get the products catalog (page, limit, filters)
  filtersForm: ProductFiltersForm | null; // used as view model for the filters form
  priceRangeState: {
    options: Options;
  };
};

const initialState: ProductsCatalogState = {
  products: [],
  totalResults: 0,
  totalItemsPerPageOptions: [10, 20, 30],
  productFilters: [],
  filterQuery: {
    page: 1,
    limit: 10,
    categoryId: null,
    filters: null,
    priceRange: { min: minPrice, max: maxPrice, overMax: true },
  },
  filtersForm: null,
  priceRangeState: {
    options: {
      floor: minPrice,
      ceil: maxPrice,
      step: 1,
      minRange: 10,
      noSwitching: true,
      translate: (): string => '',
    },
  },
};

export const ProductsCatalogStore = signalStore(
  withState(initialState),
  withRequestStatus(),
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
        tap(() => patchState(store, setPending())),
        debounceTime(400),
        switchMap((query) => {
          return store.productsService
            .getPaginatedProductsCatalogFilteredBy(query)
            .pipe(
              tapResponse({
                next: (productsCatalog) => {
                  patchState(
                    store,
                    {
                      products: productsCatalog.products.map((product) =>
                        productToProductViewModel(product, 0)
                      ),
                      totalResults: productsCatalog.totalResults,
                    },
                    setFulfilled()
                  );
                },
                error: (err) => {
                  patchState(
                    store,
                    { products: [] },
                    setError((err as Error).message)
                  );
                  console.error(err);
                  setError((err as Error).message);
                },
              })
            );
        })
      )
    ),
    getProductFilters: rxMethod<
      | (number | null)
      | { categoryId: number; priceRange: PriceRangeViewModel }
      | null
    >(
      pipe(
        filter((trigger) => trigger !== null),
        map((trigger) => {
          let query: {
            categoryId: number;
            priceRange: PriceRangeViewModel | null;
          } = { categoryId: -1, priceRange: null };
          if (typeof trigger === 'number') {
            query = { ...query, categoryId: trigger };
          } else {
            query = {
              ...query,
              categoryId: trigger.categoryId,
              priceRange: trigger.priceRange,
            };
          }
          return query;
        }),
        switchMap((trigger) => {
          return store.productsService
            .getProductsCatalogFilters({
              categoryId: trigger.categoryId,
              priceRange: trigger.priceRange,
            })
            .pipe(
              distinctUntilChanged(),
              tapResponse({
                next: (response) => {
                  const newlyFetchedProductFilters = response.map(
                    (productFilter) =>
                      productCatalogFilterToProductCatalogFilterViewModel(
                        productFilter
                      )
                  );

                  patchState(store, {
                    productFilters: newlyFetchedProductFilters,
                    filtersForm: {
                      dynamicFields: buildProductFiltersFormDynamicFields(
                        store.filtersForm(),
                        newlyFetchedProductFilters
                      ),
                    },
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
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap((filters) => {
          const filtersArray = Object.entries(filters.dynamicFields).map(
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
        })
      )
    ),
    onPriceRangeUserChangeEnd(changeContext: ChangeContext): void {
      const { value, highValue } = changeContext;

      if (!highValue) {
        return;
      }

      patchState(store, {
        filterQuery: {
          ...store.filterQuery(),
          priceRange: {
            min: value,
            max: highValue,
            overMax: highValue === maxPrice,
          },
        },
      });

      const categoryId = store.filterQuery().categoryId;

      // product filters need to be updated when price range changes
      // so we need to get the new product item counts for each filter
      if (categoryId) {
        this.getProductFilters({
          categoryId,
          priceRange: store.filterQuery().priceRange,
        });
      }
    },
    setCategoryId: (categoryId: number) => {
      patchState(store, {
        filterQuery: {
          ...store.filterQuery(),
          categoryId: categoryId,
        },
      });
    },
    changePage: ({ page, limit }: { page: number; limit: number }) => {
      patchState(store, {
        filterQuery: {
          ...store.filterQuery(),
          page: page,
          limit: limit,
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

const buildProductFiltersFormDynamicFields = (
  previousFiltersForm: ProductFiltersForm | null,
  productFilters: ProductFilterViewModel[]
): DynamicFields => {
  const dynamicFields: DynamicFields = {};

  for (const attr of productFilters) {
    switch (attr.inputType) {
      case 'checkbox':
        dynamicFields[attr.attributeId] =
          previousFiltersForm?.dynamicFields[attr.attributeId] || [];
        break;
      case 'select':
        dynamicFields[attr.attributeId] = null;
        break;
      case 'radio':
        dynamicFields[attr.attributeId] =
          previousFiltersForm?.dynamicFields[attr.attributeId] || [];
        break;
      default:
        dynamicFields[attr.attributeId] = null;
        break;
    }
  }

  return dynamicFields;
};
