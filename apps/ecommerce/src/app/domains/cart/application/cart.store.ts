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
  withEventHandlers,
  withReducer,
} from '@ngrx/signals/events';
import { tapResponse } from '@ngrx/operators';
import {
  catchError,
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
  type CatalogBrowseCartAddInput,
  type CatalogCartLineSnapshot,
  type ClientCartEnvelopeV1,
  decrementLineQuantityOrRemove,
  GUEST_CART_LOCAL_STORAGE_KEY,
  incrementLineQuantity,
  removeLineByMainProductItemId,
  tryParseClientCartEnvelope,
} from '../domain/public-api';
import { CartApiService } from '../infrastructure/public-api';
import type { CartApiResponseModel } from '../infrastructure/public-api';
import { cartCatalogEvents, cartUiEvents } from './events';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

type CartState = {
  items: CatalogCartLineSnapshot[];
  isAuthenticated: boolean;
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
  isAuthenticated: false,
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
        switchMap((isAuthenticated) => {
          if (isAuthenticated) {
            const wasGuest = !store.isAuthenticated();
            const hadNoItems = store.items().length === 0;

            patchState(store, { isAuthenticated: true });

            // false→true with empty guest cart → hydrate from server
            if (wasGuest && hadNoItems) {
              return store.cartApiService
                .getCart(store.authStore.session()?.accessToken ?? '')
                .pipe(
                  tap((res) =>
                    patchState(store, {
                      ...mapCartResponse(res),
                      isAuthenticated: true,
                      pendingMainProductItemId: null,
                    }),
                  ),
                  catchError((err) => {
                    // 401: absorb — AuthStore owns the session lifecycle
                    if (!is401(err)) {
                      patchState(store, setError('Failed to load cart'));
                    }
                    return EMPTY;
                  }),
                );
            }
            return EMPTY;
          } else {
            // Logout (or initial false)
            if (store.isAuthenticated()) {
              // Was authenticated → clear local state, reset to guest mode
              patchState(store, {
                items: [],
                cartItemIdMap: {},
                isAuthenticated: false,
                pendingMainProductItemId: null,
              });
            }
            return EMPTY;
          }
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

    addFromBrowseRow(row: CatalogBrowseCartAddInput, quantity = 1) {
      if (!store.isAuthenticated()) {
        patchState(store, (s) => ({
          items: addOrMergeLines(s.items, row, quantity),
        }));
        persistItems(store.storage, store.platformId, store.items());
        return;
      }
      patchState(store, {
        ...setPending(),
        pendingMainProductItemId: row.mainProductItemId,
      });
      store.cartApiService
        .addItem(
          { productItemId: row.mainProductItemId, quantity },
          store.authStore.session()?.accessToken ?? '',
        )
        .pipe(
          tapResponse({
            next: (res) =>
              patchState(
                store,
                { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
                setFulfilled(),
              ),
            error: (err) =>
              handleApiError(store, err),
          }),
        )
        .subscribe();
    },

    incrementLine(mainProductItemId: number) {
      if (!store.isAuthenticated()) {
        patchState(store, (s) => ({
          items: incrementLineQuantity(s.items, mainProductItemId),
        }));
        persistItems(store.storage, store.platformId, store.items());
        return;
      }
      const cartItemId = store.cartItemIdMap()[mainProductItemId];
      const currentQty =
        store.items().find((i) => i.mainProductItemId === mainProductItemId)
          ?.quantity ?? 0;
      if (cartItemId === undefined) return;
      patchState(store, {
        ...setPending(),
        pendingMainProductItemId: mainProductItemId,
      });
      store.cartApiService
        .updateItem(
          cartItemId,
          currentQty + 1,
          store.authStore.session()?.accessToken ?? '',
        )
        .pipe(
          tapResponse({
            next: (res) =>
              patchState(
                store,
                { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
                setFulfilled(),
              ),
            error: (err) =>
              handleApiError(store, err),
          }),
        )
        .subscribe();
    },

    decrementLine(mainProductItemId: number) {
      if (!store.isAuthenticated()) {
        patchState(store, (s) => ({
          items: decrementLineQuantityOrRemove(s.items, mainProductItemId),
        }));
        persistItems(store.storage, store.platformId, store.items());
        return;
      }
      const cartItemId = store.cartItemIdMap()[mainProductItemId];
      const currentQty =
        store.items().find((i) => i.mainProductItemId === mainProductItemId)
          ?.quantity ?? 0;
      if (cartItemId === undefined) return;
      patchState(store, {
        ...setPending(),
        pendingMainProductItemId: mainProductItemId,
      });
      const apiCall$ =
        currentQty <= 1
          ? store.cartApiService.removeItem(
              cartItemId,
              store.authStore.session()?.accessToken ?? '',
            )
          : store.cartApiService.updateItem(
              cartItemId,
              currentQty - 1,
              store.authStore.session()?.accessToken ?? '',
            );
      apiCall$
        .pipe(
          tapResponse({
            next: (res) =>
              patchState(
                store,
                { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
                setFulfilled(),
              ),
            error: (err) =>
              handleApiError(store, err),
          }),
        )
        .subscribe();
    },

    removeLine(mainProductItemId: number) {
      if (!store.isAuthenticated()) {
        patchState(store, (s) => ({
          items: removeLineByMainProductItemId(s.items, mainProductItemId),
        }));
        persistItems(store.storage, store.platformId, store.items());
        return;
      }
      const cartItemId = store.cartItemIdMap()[mainProductItemId];
      if (cartItemId === undefined) return;
      patchState(store, {
        ...setPending(),
        pendingMainProductItemId: mainProductItemId,
      });
      store.cartApiService
        .removeItem(cartItemId, store.authStore.session()?.accessToken ?? '')
        .pipe(
          tapResponse({
            next: (res) =>
              patchState(
                store,
                { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
                setFulfilled(),
              ),
            error: (err) =>
              handleApiError(store, err),
          }),
        )
        .subscribe();
    },
  })),

  // ── Event-driven reducers ─────────────────────────────────────────────────
  /**
   * Guest-only local state updates. Authenticated users return a no-op `{}`
   * so the event-handler API path can replace state from the server response.
   * `clearCart` always clears locally (server already cleared on order placement).
   */
  withReducer(
    on(cartCatalogEvents.addFromBrowse, ({ payload }) => (state: CartState) => {
      if (state.isAuthenticated) return {};
      return { items: addOrMergeLines(state.items, payload, 1) };
    }),
    on(cartCatalogEvents.decrementItem, ({ payload }) => (state: CartState) => {
      if (state.isAuthenticated) return {};
      return {
        items: decrementLineQuantityOrRemove(
          state.items,
          payload.mainProductItemId,
        ),
      };
    }),
    on(cartUiEvents.incrementItem, ({ payload }) => (state: CartState) => {
      if (state.isAuthenticated) return {};
      return {
        items: incrementLineQuantity(state.items, payload.mainProductItemId),
      };
    }),
    on(
      cartUiEvents.decrementOrRemoveItem,
      ({ payload }) =>
        (state: CartState) => {
          if (state.isAuthenticated) return {};
          return {
            items: decrementLineQuantityOrRemove(
              state.items,
              payload.mainProductItemId,
            ),
          };
        },
    ),
    on(cartUiEvents.removeItem, ({ payload }) => (state: CartState) => {
      if (state.isAuthenticated) return {};
      return {
        items: removeLineByMainProductItemId(
          state.items,
          payload.mainProductItemId,
        ),
      };
    }),
    // clearCart always clears locally regardless of auth mode
    on(cartUiEvents.clearCart, () => () => ({
      items: [] as CatalogCartLineSnapshot[],
      cartItemIdMap: {},
      pendingMainProductItemId: null,
    })),
  ),

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
        filter(() => !store.isAuthenticated()),
        tap(() => persistItems(store.storage, store.platformId, store.items())),
      ),

    /** Auth: addFromBrowse → POST /cart/items */
    authAddFromBrowse$: events.on(cartCatalogEvents.addFromBrowse).pipe(
      filter(() => store.isAuthenticated()),
      switchMap(({ payload }) => {
        patchState(store, {
          ...setPending(),
          pendingMainProductItemId: payload.mainProductItemId,
        });
        return store.cartApiService
          .addItem(
            { productItemId: payload.mainProductItemId, quantity: 1 },
            store.authStore.session()?.accessToken ?? '',
          )
          .pipe(
            tap((res) =>
              patchState(
                store,
                { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
                setFulfilled(),
              ),
            ),
            catchError((err) => {
              handleApiError(store, err);
              return EMPTY;
            }),
          );
      }),
    ),

    /** Auth: decrementItem → PATCH qty-1 or DELETE when qty=1 */
    authDecrementItem$: events.on(cartCatalogEvents.decrementItem).pipe(
      filter(() => store.isAuthenticated()),
      switchMap(({ payload }) => {
        const { mainProductItemId } = payload;
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
            ? store.cartApiService.removeItem(
                cartItemId,
                store.authStore.session()?.accessToken ?? '',
              )
            : store.cartApiService.updateItem(
                cartItemId,
                currentQty - 1,
                store.authStore.session()?.accessToken ?? '',
              );
        return apiCall$.pipe(
          tap((res) =>
            patchState(
              store,
              { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
              setFulfilled(),
            ),
          ),
          catchError((err) => {
            handleApiError(store, err);
            return EMPTY;
          }),
        );
      }),
    ),

    /** Auth: incrementItem → PATCH qty+1 */
    authIncrementItem$: events.on(cartUiEvents.incrementItem).pipe(
      filter(() => store.isAuthenticated()),
      switchMap(({ payload }) => {
        const { mainProductItemId } = payload;
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
          .updateItem(
            cartItemId,
            currentQty + 1,
            store.authStore.session()?.accessToken ?? '',
          )
          .pipe(
            tap((res) =>
              patchState(
                store,
                { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
                setFulfilled(),
              ),
            ),
            catchError((err) => {
              handleApiError(store, err);
              return EMPTY;
            }),
          );
      }),
    ),

    /** Auth: decrementOrRemoveItem → PATCH qty-1 or DELETE when qty=1 */
    authDecrementOrRemoveItem$: events
      .on(cartUiEvents.decrementOrRemoveItem)
      .pipe(
        filter(() => store.isAuthenticated()),
        switchMap(({ payload }) => {
          const { mainProductItemId } = payload;
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
              ? store.cartApiService.removeItem(
                  cartItemId,
                  store.authStore.session()?.accessToken ?? '',
                )
              : store.cartApiService.updateItem(
                  cartItemId,
                  currentQty - 1,
                  store.authStore.session()?.accessToken ?? '',
                );
          return apiCall$.pipe(
            tap((res) =>
              patchState(
                store,
                { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
                setFulfilled(),
              ),
            ),
            catchError((err) => {
              handleApiError(store, err);
              return EMPTY;
            }),
          );
        }),
      ),

    /** Auth: removeItem → DELETE */
    authRemoveItem$: events.on(cartUiEvents.removeItem).pipe(
      filter(() => store.isAuthenticated()),
      switchMap(({ payload }) => {
        const cartItemId = store.cartItemIdMap()[payload.mainProductItemId];
        if (cartItemId === undefined) return EMPTY;
        patchState(store, {
          ...setPending(),
          pendingMainProductItemId: payload.mainProductItemId,
        });
        return store.cartApiService
          .removeItem(cartItemId, store.authStore.session()?.accessToken ?? '')
          .pipe(
            tap((res) =>
              patchState(
                store,
                { ...mapCartResponse(res), isAuthenticated: true, pendingMainProductItemId: null },
                setFulfilled(),
              ),
            ),
            catchError((err) => {
              handleApiError(store, err);
              return EMPTY;
            }),
          );
      }),
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
