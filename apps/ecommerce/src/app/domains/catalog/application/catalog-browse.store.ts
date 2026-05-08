import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';

import type { CatalogListResponse, CatalogSort } from '../domain/public-api';
import { mapCatalogListFromWire } from './catalog-list.mapper';
import { CatalogApiService } from '../infrastructure/public-api';

type CatalogBrowseState = {
  page: number;
  pageSize: number;
  sort: CatalogSort;
  searchQuery: string;
  selectedCategoryRootId: number | null;
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
  categoryRoots: [],
  categoryRootsLoading: false,
  categoryRootsError: null,
  loading: false,
  error: null,
  data: null,
};

export const CatalogBrowseStore = signalStore(
  withState(initialState),
  withProps(() => ({
    api: inject(CatalogApiService),
  })),
  withMethods((store) => {
    const fetchCatalog = () => {
      patchState(store, { loading: true, error: null });
      store.api
        .list({
          page: store.page(),
          pageSize: store.pageSize(),
          sort: store.sort(),
          q: store.searchQuery().trim() || undefined,
          categoryRootId:
            store.selectedCategoryRootId() === null
              ? undefined
              : store.selectedCategoryRootId()!,
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
        )
        .subscribe();
    };

    return {
      load: fetchCatalog,
      loadCategoryRoots() {
        patchState(store, {
          categoryRootsLoading: true,
          categoryRootsError: null,
        });
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
        ).subscribe();
      },
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
          page: 1,
        });
        fetchCatalog();
      },
    };
  })
);
