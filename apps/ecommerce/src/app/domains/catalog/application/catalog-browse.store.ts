import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

import type { AttributeFacet, CatalogListResponse, CatalogSort } from '../domain/public-api';
import { mapCatalogListFromWire } from './catalog-list.mapper';
import { CatalogApiService } from '../infrastructure/public-api';

type CatalogBrowseState = {
  page: number;
  pageSize: number;
  sort: CatalogSort;
  searchQuery: string;
  selectedCategoryRootId: number | null;
  /** Inclusive min **Sale Price** (main item); `null` = no lower bound. */
  salePriceMin: number | null;
  /** Inclusive max **Sale Price** (main item); `null` = no upper bound. */
  salePriceMax: number | null;
  /**
   * Inclusive minimum exact average **Rating** (1–5); `null` = no rating filter.
   */
  minRating: number | null;
  /**
   * Active attribute filters: map of `attributeId` → selected `valueId`.
   * v1 is single-select per attribute (AND across attributes).
   */
  selectedAttributeFilters: Record<number, number>;
  categoryRoots: { id: number; name: string | null }[];
  categoryRootsLoading: boolean;
  categoryRootsError: string | null;
  loading: boolean;
  error: string | null;
  data: CatalogListResponse | null;
};

const initialState: CatalogBrowseState = {
  page: 1,
  pageSize: 12,
  sort: 'newest',
  searchQuery: '',
  selectedCategoryRootId: null,
  salePriceMin: null,
  salePriceMax: null,
  minRating: null,
  selectedAttributeFilters: {},
  categoryRoots: [],
  categoryRootsLoading: false,
  categoryRootsError: null,
  loading: false,
  error: null,
  data: null,
};

export const CatalogBrowseStore = signalStore(
  withState(initialState),
  withComputed(({ searchQuery, data }) => ({
    trimmedSearchQuery: computed(() => searchQuery().trim()),
    /** Dynamic attribute facets from the latest catalog response. */
    facets: computed((): AttributeFacet[] => data()?.facets ?? []),
  })),
  withProps(() => ({
    api: inject(CatalogApiService),
  })),
  withMethods((store) => {
    const load = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const q = store.trimmedSearchQuery();
          const categoryRootId = store.selectedCategoryRootId();
          const filters = store.selectedAttributeFilters();
          return store.api
            .list({
              page: store.page(),
              pageSize: store.pageSize(),
              sort: store.sort(),
              q: q || undefined,
              categoryRootId:
                categoryRootId === null ? undefined : categoryRootId,
              salePriceMin: store.salePriceMin(),
              salePriceMax: store.salePriceMax(),
              minRating: store.minRating(),
              attributeFilters:
                Object.keys(filters).length > 0 ? filters : undefined,
            })
            .pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    data: mapCatalogListFromWire(res),
                    loading: false,
                  }),
                error: () =>
                  patchState(store, {
                    error: 'catalog.loadError',
                    loading: false,
                  }),
              })
            );
        })
      )
    );

    const loadCategoryRoots = rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, {
            categoryRootsLoading: true,
            categoryRootsError: null,
          })
        ),
        switchMap(() =>
          store.api.listCategoryRoots().pipe(
            tapResponse({
              next: (res) =>
                patchState(store, {
                  categoryRoots: res.roots,
                  categoryRootsLoading: false,
                }),
              error: () =>
                patchState(store, {
                  categoryRootsError: 'catalog.categoryRootsLoadError',
                  categoryRootsLoading: false,
                }),
            })
          )
        )
      )
    );

    return {
      load,
      loadCategoryRoots,
      setPage(page: number) {
        patchState(store, { page });
      },
      setPageSize(pageSize: number) {
        patchState(store, { pageSize });
      },
      setSort(sort: CatalogSort) {
        patchState(store, { sort });
      },
      setSearchQuery(searchQuery: string) {
        patchState(store, { searchQuery });
      },
      setCategoryRoot(categoryRootId: number | null) {
        if (store.selectedCategoryRootId() === categoryRootId) {
          return;
        }
        patchState(store, {
          selectedCategoryRootId: categoryRootId,
          selectedAttributeFilters: {},
          page: 1,
        });
        load();
      },
      setSalePriceRange(salePriceMin: number | null, salePriceMax: number | null) {
        patchState(store, {
          salePriceMin,
          salePriceMax,
          page: 1,
        });
        load();
      },
      /**
       * Set (or clear) the minimum exact average rating filter.
       * Passing `null` clears the filter. Values are 1–5.
       */
      setMinRating(minRating: number | null) {
        if (store.minRating() === minRating) {
          return;
        }
        patchState(store, { minRating, page: 1 });
        load();
      },
      /**
       * Set (or clear) the selected value for one attribute facet.
       * Passing `valueId = null` clears that attribute's filter.
       * v1: single-select per attribute.
       */
      setAttributeFilter(attributeId: number, valueId: number | null) {
        const current = store.selectedAttributeFilters();
        if (valueId === null) {
          const updated = { ...current };
          delete updated[attributeId];
          patchState(store, { selectedAttributeFilters: updated, page: 1 });
        } else {
          patchState(store, {
            selectedAttributeFilters: { ...current, [attributeId]: valueId },
            page: 1,
          });
        }
        load();
      },
      /** Clear all active attribute filters and reload. */
      clearAttributeFilters() {
        patchState(store, { selectedAttributeFilters: {}, page: 1 });
        load();
      },
    };
  })
);
