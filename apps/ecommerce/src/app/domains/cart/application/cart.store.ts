import { isPlatformBrowser } from '@angular/common';
import { computed, inject, PLATFORM_ID } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  Events,
  on,
  ReducerEvents,
  withEventHandlers,
  withReducer,
} from '@ngrx/signals/events';
import { tapResponse } from '@ngrx/operators';
import {
  distinctUntilChanged,
  EMPTY,
  filter,
  pipe,
  switchMap,
  tap,
} from 'rxjs';

import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';
import { AuthStore } from '@full-stack-nx-workspace/auth-web';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@full-stack-nx-workspace/store';

import {
  addOrMergeLines,
  CLIENT_CART_SCHEMA_VERSION,
  type CatalogCartLineSnapshot,
  type ClientCartEnvelopeV1,
  decrementLineQuantityOrRemove,
  GUEST_CART_LOCAL_STORAGE_KEY,
  incrementLineQuantity,
  removeLineByMainProductItemId,
  tryParseClientCartEnvelope,
} from '../domain/public-api';
import { CartApiService } from '../infrastructure/public-api';
import type {
  CartApiResponseModel,
  MergeCartItemDto,
} from '../infrastructure/public-api';
import { cartCatalogEvents, cartUiEvents } from './events';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

type CartState = {
  items: CatalogCartLineSnapshot[];
  /**
   * Map of `mainProductItemId → server cartItemId`.
   * Populated when the server cart is loaded; required for PATCH/DELETE routes.
   */
  cartItemIdMap: Record<number, number>;
  /**
   * Which catalog line is awaiting a server cart response (authenticated mode only).
   * Drives per-row / per-card loading UI; `null` when idle.
   */
  pendingMainProductItemId: number | null;
};

const emptyState: CartState = {
  items: [],
  cartItemIdMap: {},
  pendingMainProductItemId: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadGuestCartItems(
  storage: LocalStorageFacade,
  platformId: object,
): CatalogCartLineSnapshot[] {
  if (!isPlatformBrowser(platformId)) return [];
  const raw = storage.getJson<unknown>(GUEST_CART_LOCAL_STORAGE_KEY);
  return tryParseClientCartEnvelope(raw)?.items ?? [];
}

function persistItems(
  storage: LocalStorageFacade,
  platformId: object,
  items: CatalogCartLineSnapshot[],
): void {
  if (!isPlatformBrowser(platformId)) return;
  const envelope: ClientCartEnvelopeV1 = {
    schemaVersion: CLIENT_CART_SCHEMA_VERSION,
    items,
  };

  storage.setJson(GUEST_CART_LOCAL_STORAGE_KEY, envelope);
}

function mapCartResponse(
  response: CartApiResponseModel,
): Pick<CartState, 'items' | 'cartItemIdMap'> {
  const cartItemIdMap: Record<number, number> = {};
  const items: CatalogCartLineSnapshot[] = response.items.map((item) => {
    cartItemIdMap[item.productItemId] = item.id;
    return {
      quantity: item.quantity,
      /** productId is not returned by the Cart API — sentinel value used. */
      productId: 0,
      mainProductItemId: item.productItemId,
      name: item.capturedName,
      salePrice: item.capturedPrice,
      originalPrice: item.currentPrice,
      primaryImageUrl: item.capturedImageUrl,
    };
  });
  return { items, cartItemIdMap };
}

function is401(err: unknown): boolean {
  return err instanceof HttpErrorResponse && err.status === 401;
}

function patchCartState(store: object, res: CartApiResponseModel): void {
  patchState(store as never, {
    ...mapCartResponse(res),
    pendingMainProductItemId: null,
  });
}

function absorbOrSetError(store: object, err: unknown, message: string): void {
  if (!is401(err)) {
    patchState(store as never, setError(message));
  }
}

function handleApiError(store: object, err: unknown): void {
  if (is401(err)) {
    patchState(
      store as never,
      { pendingMainProductItemId: null },
      setFulfilled(),
    );
  } else {
    patchState(
      store as never,
      { pendingMainProductItemId: null },
      setError(err instanceof Error ? err.message : 'Unknown cart API error'),
    );
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(emptyState),
  withRequestStatus(),
  withProps(() => ({
    storage: inject(LocalStorageFacade),
    platformId: inject(PLATFORM_ID),
    authStore: inject(AuthStore),
    cartApiService: inject(CartApiService),
  })),
  withComputed(({ items }) => ({
    totalUnitCount: computed(() =>
      items().reduce((sum, l) => sum + l.quantity, 0),
    ),
  })),

  // ── Auth-reaction rxMethod (defined first so it's on `store` for withHooks) ──
  withMethods((store) => ({
    /**
     * Subscribe to `AuthStore.isAuthenticated` changes.
     * Call once in `onInit` via `store._watchAuth(toObservable(authStore.isAuthenticated))`.
     */
    _watchAuth: rxMethod<boolean>(
      pipe(
        distinctUntilChanged(),
        filter((authenticated) => authenticated),
        switchMap(() => {
          const guestCart = loadGuestCartItems(store.storage, store.platformId);

          // non-empty guest cart → merge guest items into server cart
          if (guestCart.length > 0) {
            const mergePayload: MergeCartItemDto[] = guestCart.map((item) => ({
              productItemId: item.mainProductItemId,
              quantity: item.quantity,
              capturedSalePrice: item.salePrice,
              capturedName: item.name,
              capturedImageUrl: item.primaryImageUrl,
            }));
            return store.cartApiService.mergeCart(mergePayload).pipe(
              tapResponse({
                next: (res) => {
                  patchCartState(store, res);
                  store.storage.remove(GUEST_CART_LOCAL_STORAGE_KEY);
                },
                // localStorage guest cart is intentionally left intact on failure
                error: (err) =>
                  absorbOrSetError(store, err, 'Failed to merge cart'),
              }),
            );
          }

          // empty guest cart → hydrate from server
          if (guestCart.length === 0) {
            return store.cartApiService.getCart().pipe(
              tapResponse({
                next: (res) => patchCartState(store, res),
                error: (err) =>
                  absorbOrSetError(store, err, 'Failed to load cart'),
              }),
            );
          }
          return EMPTY;
        }),
      ),
    ),
  })),

  // ── Public direct-call mutations ─────────────────────────────────────────
  withMethods((store) => ({
    /** Re-read persisted guest cart (recovery / testing). */
    rehydrateFromStorage() {
      patchState(store, {
        items: loadGuestCartItems(store.storage, store.platformId),
      });
    },

    incrementLine: rxMethod<number>(
      pipe(
        switchMap((mainProductItemId) => {
          if (!store.authStore.isAuthenticated()) {
            patchState(store, (s) => ({
              items: incrementLineQuantity(s.items, mainProductItemId),
            }));
            persistItems(store.storage, store.platformId, store.items());
            return EMPTY;
          }

          const cartItemId = store.cartItemIdMap()[mainProductItemId];
          const currentQty =
            store.items().find((i) => i.mainProductItemId === mainProductItemId)
              ?.quantity ?? 0;
          if (cartItemId === undefined) return EMPTY;
          patchState(store, {
            ...setPending(),
            pendingMainProductItemId: mainProductItemId,
          });

          return store.cartApiService
            .updateItem(cartItemId, currentQty + 1)
            .pipe(
              tapResponse({
                next: (res) =>
                  patchState(
                    store,
                    { ...mapCartResponse(res), pendingMainProductItemId: null },
                    setFulfilled(),
                  ),
                error: (err) => handleApiError(store, err),
              }),
            );
        }),
      ),
    ),

    decrementLine: rxMethod<number>(
      pipe(
        switchMap((mainProductItemId) => {
          if (!store.authStore.isAuthenticated()) {
            patchState(store, (s) => ({
              items: decrementLineQuantityOrRemove(s.items, mainProductItemId),
            }));
            persistItems(store.storage, store.platformId, store.items());
            return EMPTY;
          }
          const cartItemId = store.cartItemIdMap()[mainProductItemId];
          const currentQty =
            store.items().find((i) => i.mainProductItemId === mainProductItemId)
              ?.quantity ?? 0;
          if (cartItemId === undefined) return EMPTY;
          patchState(store, {
            ...setPending(),
            pendingMainProductItemId: mainProductItemId,
          });
          const apiCall$ =
            currentQty <= 1
              ? store.cartApiService.removeItem(cartItemId)
              : store.cartApiService.updateItem(cartItemId, currentQty - 1);

          return apiCall$.pipe(
            tapResponse({
              next: (res) =>
                patchState(
                  store,
                  {
                    ...mapCartResponse(res),
                    pendingMainProductItemId: null,
                  },
                  setFulfilled(),
                ),
              error: (err) => handleApiError(store, err),
            }),
          );
        }),
      ),
    ),

    removeLine: rxMethod<number>(
      pipe(
        switchMap((mainProductItemId) => {
          if (!store.authStore.isAuthenticated()) {
            patchState(store, (s) => ({
              items: removeLineByMainProductItemId(s.items, mainProductItemId),
            }));
            persistItems(store.storage, store.platformId, store.items());
            return EMPTY;
          }
          const cartItemId = store.cartItemIdMap()[mainProductItemId];
          if (cartItemId === undefined) return EMPTY;
          patchState(store, {
            ...setPending(),
            pendingMainProductItemId: mainProductItemId,
          });
          return store.cartApiService.removeItem(cartItemId).pipe(
            tapResponse({
              next: (res) =>
                patchState(
                  store,
                  {
                    ...mapCartResponse(res),
                    pendingMainProductItemId: null,
                  },
                  setFulfilled(),
                ),
              error: (err) => handleApiError(store, err),
            }),
          );
        }),
      ),
    ),
  })),

  // ── Event-driven reducers ─────────────────────────────────────────────────
  /**
   * Guest-only local state updates.
   * `clearCart` always clears locally (server already cleared on order placement).
   */
  withReducer(
    // clearCart always clears locally regardless of auth mode
    on(cartUiEvents.clearCart, () => () => ({
      items: [] as CatalogCartLineSnapshot[],
      cartItemIdMap: {},
      pendingMainProductItemId: null,
    })),
  ),
  // reducer events is called before events service
  withEventHandlers((store, events = inject(ReducerEvents)) => ({
    /** Guest: addFromBrowse → add to local state */
    guestAddFromBrowse$: events.on(cartCatalogEvents.addFromBrowse).pipe(
      filter(() => !store.authStore.isAuthenticated()),
      tap(({ payload }) => {
        patchState(store, {
          items: addOrMergeLines(store.items(), payload, 1),
        });
      }),
    ),
    /** Guest: decrementItem → decrement local state */
    guestDecrementItem$: events
      .on(cartCatalogEvents.decrementItem, cartUiEvents.decrementOrRemoveItem)
      .pipe(
        filter(() => !store.authStore.isAuthenticated()),
        tap(({ payload }) => {
          patchState(store, {
            items: decrementLineQuantityOrRemove(
              store.items(),
              payload.mainProductItemId,
            ),
          });
        }),
      ),

    /** Guest: incrementItem → increment local state */
    guestIncrementItem$: events.on(cartUiEvents.incrementItem).pipe(
      filter(() => !store.authStore.isAuthenticated()),
      tap(({ payload }) => {
        patchState(store, {
          items: incrementLineQuantity(
            store.items(),
            payload.mainProductItemId,
          ),
        });
      }),
    ),

    /** Guest: removeItem → remove local state */
    guestRemoveItem$: events.on(cartUiEvents.removeItem).pipe(
      filter(() => !store.authStore.isAuthenticated()),
      tap(({ payload }) => {
        patchState(store, {
          items: removeLineByMainProductItemId(
            store.items(),
            payload.mainProductItemId,
          ),
        });
      }),
    ),
  })),

  // ── Event-driven side effects ─────────────────────────────────────────────
  withEventHandlers((store, events = inject(Events)) => ({
    /** Persist guest cart to localStorage after any mutation event. */
    persistGuestCart$: events
      .on(
        cartCatalogEvents.addFromBrowse,
        cartCatalogEvents.decrementItem,
        cartUiEvents.incrementItem,
        cartUiEvents.decrementOrRemoveItem,
        cartUiEvents.removeItem,
        cartUiEvents.clearCart,
      )
      .pipe(
        filter(() => !store.authStore.isAuthenticated()),
        tap(() => persistItems(store.storage, store.platformId, store.items())),
      ),

    /** Auth: addFromBrowse → POST /cart/items */
    authAddFromBrowse$: events.on(cartCatalogEvents.addFromBrowse).pipe(
      filter(() => store.authStore.isAuthenticated()),
      switchMap(({ payload }) => {
        patchState(store, {
          ...setPending(),
          pendingMainProductItemId: payload.mainProductItemId,
        });
        return store.cartApiService
          .addItem({ productItemId: payload.mainProductItemId, quantity: 1 })
          .pipe(
            tapResponse({
              next: (res) =>
                patchState(
                  store,
                  {
                    ...mapCartResponse(res),
                    pendingMainProductItemId: null,
                  },
                  setFulfilled(),
                ),
              error: (err) => handleApiError(store, err),
            }),
          );
      }),
    ),

    /** Auth: decrementItem → PATCH qty-1 or DELETE when qty=1 */
    authDecrementItem$: events.on(cartCatalogEvents.decrementItem).pipe(
      filter(() => store.authStore.isAuthenticated()),
      tap(({ payload }) => store.decrementLine(payload.mainProductItemId)),
    ),

    /** Auth: incrementItem → delegate to incrementLine (owns the PATCH logic) */
    authIncrementItem$: events.on(cartUiEvents.incrementItem).pipe(
      filter(() => store.authStore.isAuthenticated()),
      tap(({ payload }) => store.incrementLine(payload.mainProductItemId)),
    ),

    /** Auth: decrementOrRemoveItem → PATCH qty-1 or DELETE when qty=1 */
    authDecrementOrRemoveItem$: events
      .on(cartUiEvents.decrementOrRemoveItem)
      .pipe(
        filter(() => store.authStore.isAuthenticated()),
        tap(({ payload }) => store.decrementLine(payload.mainProductItemId)),
      ),

    /** Auth: removeItem → DELETE */
    authRemoveItem$: events.on(cartUiEvents.removeItem).pipe(
      filter(() => store.authStore.isAuthenticated()),
      tap(({ payload }) => store.removeLine(payload.mainProductItemId)),
    ),
  })),

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  withHooks({
    onInit(store) {
      // Hydrate guest cart from localStorage
      patchState(store, {
        items: loadGuestCartItems(store.storage, store.platformId),
      });

      // Start auth-reaction: watches AuthStore.isAuthenticated
      store._watchAuth(toObservable(store.authStore.isAuthenticated));
    },
  }),
);
