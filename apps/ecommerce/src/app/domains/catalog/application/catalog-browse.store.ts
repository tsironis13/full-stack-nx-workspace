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
  loading: boolean;
  error: string | null;
  data: CatalogListResponse | null;
};

const initialState: CatalogBrowseState = {
  page: 1,
  pageSize: 12,
  sort: 'newest',
  searchQuery: '',
  loading: false,
  error: null,
  data: null,
};

export const CatalogBrowseStore = signalStore(
  withState(initialState),
  withProps(() => ({
    api: inject(CatalogApiService),
  })),
  withMethods((store) => ({
    load() {
      patchState(store, { loading: true, error: null });
      store.api
        .list({
          page: store.page(),
          pageSize: store.pageSize(),
          sort: store.sort(),
          q: store.searchQuery().trim() || undefined,
        })
        .pipe(
          tapResponse({
            next: (res) =>
              patchState(store, {
                data: mapCatalogListFromWire(res),
                loading: false,
              }),
            error: () =>
              patchState(store, { error: 'catalog.loadError', loading: false }),
          })
        )
        .subscribe();
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
  }))
);
