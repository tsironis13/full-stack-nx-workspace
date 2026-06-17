import { HttpErrorResponse } from '@angular/common/http';
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
import { EMPTY, pipe, switchMap, tap } from 'rxjs';

import type { MyReview, ReviewDraft } from '../domain/public-api';
import { ProductReviewsApiService } from '../infrastructure/public-api';
import { mapMyReviewFromWire } from './product-reviews.mapper';

/**
 * Owns the author write path for Reviews (submit / edit / soft-delete / load
 * own review) from the product detail page. The store lives in this slice
 * because the consuming page is a same-domain `domain-feature` and may inject
 * it directly under `eslint-plugin-boundaries`.
 *
 * FUTURE (order-history entry point, ADR 0001): when a second consumer such as
 * `domains/orders` needs these commands, promote this to a Reviews bounded
 * context exposing `events.ts` (submit/edit/delete) + `anti-corruption-layer.ts`
 * (read adapter for the current user's review + eligibility), and have both the
 * product page and order history consume only the ACL — never this store type.
 */
type ReviewSubmissionStatus = 'idle' | 'loading' | 'saving' | 'deleting';

type ReviewSubmissionState = {
  productId: number | null;
  myReview: MyReview | null;
  status: ReviewSubmissionStatus;
  loaded: boolean;
  notEligible: boolean;
  error: string | null;
};

const initialState: ReviewSubmissionState = {
  productId: null,
  myReview: null,
  status: 'idle',
  loaded: false,
  notEligible: false,
  error: null,
};

function draftToRequest(draft: ReviewDraft) {
  return {
    rating: draft.rating,
    title: draft.title ?? undefined,
    body: draft.body ?? undefined,
  };
}

export const ReviewSubmissionStore = signalStore(
  withState(initialState),
  withComputed(({ myReview, status }) => ({
    hasReview: computed(() => myReview() !== null),
    saving: computed(() => status() === 'saving' || status() === 'deleting'),
  })),
  withProps(() => ({
    api: inject(ProductReviewsApiService),
  })),
  withMethods((store) => {
    const load = rxMethod<number>(
      pipe(
        tap((productId) =>
          patchState(store, {
            productId,
            status: 'loading',
            error: null,
          }),
        ),
        switchMap((productId) =>
          store.api.getMine(productId).pipe(
            tapResponse({
              next: (wire) =>
                patchState(store, {
                  myReview: mapMyReviewFromWire(wire),
                  status: 'idle',
                  loaded: true,
                }),
              error: (err: HttpErrorResponse) => {
                // 404 simply means the user has no review yet.
                patchState(store, {
                  myReview: null,
                  status: 'idle',
                  loaded: true,
                  error: err.status === 404 ? null : 'product.reviewLoadError',
                });
              },
            }),
          ),
        ),
      ),
    );

    const submit = rxMethod<ReviewDraft>(
      pipe(
        tap(() => patchState(store, { status: 'saving', error: null })),
        switchMap((draft) => {
          const productId = store.productId();
          if (productId == null) {
            patchState(store, { status: 'idle' });
            return EMPTY;
          }
          return store.api.submit(productId, draftToRequest(draft)).pipe(
            tapResponse({
              next: (wire) =>
                patchState(store, {
                  myReview: mapMyReviewFromWire(wire),
                  status: 'idle',
                  notEligible: false,
                }),
              error: (err: HttpErrorResponse) => {
                if (err.status === 403) {
                  patchState(store, { status: 'idle', notEligible: true });
                  return;
                }
                if (err.status === 409) {
                  // A review already exists — reload the authoritative copy.
                  patchState(store, { status: 'idle' });
                  load(productId);
                  return;
                }
                patchState(store, {
                  status: 'idle',
                  error: 'product.reviewSubmitError',
                });
              },
            }),
          );
        }),
      ),
    );

    const edit = rxMethod<ReviewDraft>(
      pipe(
        tap(() => patchState(store, { status: 'saving', error: null })),
        switchMap((draft) => {
          const productId = store.productId();
          if (productId == null) {
            patchState(store, { status: 'idle' });
            return EMPTY;
          }
          return store.api.edit(productId, draftToRequest(draft)).pipe(
            tapResponse({
              next: (wire) =>
                patchState(store, {
                  myReview: mapMyReviewFromWire(wire),
                  status: 'idle',
                }),
              error: () =>
                patchState(store, {
                  status: 'idle',
                  error: 'product.reviewSubmitError',
                }),
            }),
          );
        }),
      ),
    );

    const remove = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'deleting', error: null })),
        switchMap(() => {
          const productId = store.productId();
          if (productId == null) {
            patchState(store, { status: 'idle' });
            return EMPTY;
          }
          return store.api.remove(productId).pipe(
            tapResponse({
              next: () =>
                patchState(store, { myReview: null, status: 'idle' }),
              error: () =>
                patchState(store, {
                  status: 'idle',
                  error: 'product.reviewDeleteError',
                }),
            }),
          );
        }),
      ),
    );

    return { load, submit, edit, remove };
  }),
);
