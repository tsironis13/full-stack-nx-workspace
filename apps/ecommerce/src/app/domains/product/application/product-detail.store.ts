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

import type { ProductReviewsPage } from '../domain/public-api';
import { formatAverageRatingForDisplay } from '../domain/public-api';
import { ProductReviewsApiService } from '../infrastructure/public-api';
import { mapProductReviewsFromWire } from './product-reviews.mapper';

type ProductDetailState = {
  productId: number | null;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  data: ProductReviewsPage | null;
};

const initialState: ProductDetailState = {
  productId: null,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  data: null,
};

export const ProductDetailStore = signalStore(
  withState(initialState),
  withComputed(({ data }) => ({
    displayedAverageRating: computed(() =>
      formatAverageRatingForDisplay(data()?.averageRating ?? null),
    ),
    hasReviews: computed(() => (data()?.reviewCount ?? 0) > 0),
  })),
  withProps(() => ({
    api: inject(ProductReviewsApiService),
  })),
  withMethods((store) => {
    const loadCurrent = (): void => {
      const productId = store.productId();
      if (productId != null) {
        load(productId);
      }
    };

    const load = rxMethod<number>(
      pipe(
        tap((productId) =>
          patchState(store, {
            productId,
            loading: true,
            error: null,
          }),
        ),
        switchMap((productId) =>
          store.api
            .list(productId, {
              page: store.page(),
              pageSize: store.pageSize(),
            })
            .pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    data: mapProductReviewsFromWire(res),
                    loading: false,
                  }),
                error: () =>
                  patchState(store, {
                    error: 'product.reviewsLoadError',
                    loading: false,
                  }),
              }),
            ),
        ),
      ),
    );

    return {
      load,
      setPage(page: number): void {
        patchState(store, { page });
        loadCurrent();
      },
      setPageSize(pageSize: number): void {
        patchState(store, { pageSize, page: 1 });
        loadCurrent();
      },
      applyPagination(page: number, pageSize: number): void {
        const pageSizeChanged = pageSize !== store.pageSize();
        patchState(store, {
          page: pageSizeChanged ? 1 : page,
          pageSize,
        });
        loadCurrent();
      },
    };
  }),
);
