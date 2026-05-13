import { isPlatformBrowser } from '@angular/common';
import { computed, inject, PLATFORM_ID } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { Events, on, withEffects, withReducer } from '@ngrx/signals/events';
import { tap } from 'rxjs';

import { LocalStorageFacade } from '../../../core/public-api';
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
import { cartCatalogEvents, cartUiEvents } from './events';

type GuestCartState = {
  items: CatalogCartLineSnapshot[];
};

const emptyState: GuestCartState = { items: [] };

function loadGuestCartItems(
  storage: LocalStorageFacade,
  platformId: object
): CatalogCartLineSnapshot[] {
  if (!isPlatformBrowser(platformId)) {
    return [];
  }
  const raw = storage.getJson<unknown>(GUEST_CART_LOCAL_STORAGE_KEY);
  return tryParseClientCartEnvelope(raw)?.items ?? [];
}

function persistItems(
  storage: LocalStorageFacade,
  platformId: object,
  items: CatalogCartLineSnapshot[]
): void {
  if (!isPlatformBrowser(platformId)) {
    return;
  }
  const envelope: ClientCartEnvelopeV1 = {
    schemaVersion: CLIENT_CART_SCHEMA_VERSION,
    items,
  };
  storage.setJson(GUEST_CART_LOCAL_STORAGE_KEY, envelope);
}

export const GuestCartStore = signalStore(
  { providedIn: 'root' },
  withState(emptyState),
  withProps(() => ({
    storage: inject(LocalStorageFacade),
    platformId: inject(PLATFORM_ID),
  })),
  withComputed(({ items }) => ({
    totalUnitCount: computed(() =>
      items().reduce((sum, l) => sum + l.quantity, 0)
    ),
  })),
  withMethods((store) => ({
    addFromBrowseRow(row: CatalogBrowseCartAddInput, quantity = 1) {
      patchState(store, (s) => ({
        items: addOrMergeLines(s.items, row, quantity),
      }));
      persistItems(store.storage, store.platformId, store.items());
    },
    incrementLine(mainProductItemId: number) {
      patchState(store, (s) => ({
        items: incrementLineQuantity(s.items, mainProductItemId),
      }));
      persistItems(store.storage, store.platformId, store.items());
    },
    decrementLine(mainProductItemId: number) {
      patchState(store, (s) => ({
        items: decrementLineQuantityOrRemove(s.items, mainProductItemId),
      }));
      persistItems(store.storage, store.platformId, store.items());
    },
    removeLine(mainProductItemId: number) {
      patchState(store, (s) => ({
        items: removeLineByMainProductItemId(s.items, mainProductItemId),
      }));
      persistItems(store.storage, store.platformId, store.items());
    },
    /** Re-read persisted guest cart (tests / rare recovery). */
    rehydrateFromStorage() {
      patchState(store, {
        items: loadGuestCartItems(store.storage, store.platformId),
      });
    },
  })),
  /**
   * Event-driven reducers: handle **Catalog → Cart** and **CartUI → Cart** ACL
   * events without consumers importing the store directly. Persistence runs in
   * `withEffects` below.
   */
  withReducer(
    on(
      cartCatalogEvents.addFromBrowse,
      ({ payload }) =>
        (state: GuestCartState) => ({
          items: addOrMergeLines(state.items, payload, 1),
        })
    ),
    on(
      cartCatalogEvents.decrementItem,
      ({ payload }) =>
        (state: GuestCartState) => ({
          items: decrementLineQuantityOrRemove(
            state.items,
            payload.mainProductItemId
          ),
        })
    ),
    on(
      cartUiEvents.incrementItem,
      ({ payload }) =>
        (state: GuestCartState) => ({
          items: incrementLineQuantity(state.items, payload.mainProductItemId),
        })
    ),
    on(
      cartUiEvents.decrementOrRemoveItem,
      ({ payload }) =>
        (state: GuestCartState) => ({
          items: decrementLineQuantityOrRemove(
            state.items,
            payload.mainProductItemId
          ),
        })
    ),
    on(
      cartUiEvents.removeItem,
      ({ payload }) =>
        (state: GuestCartState) => ({
          items: removeLineByMainProductItemId(
            state.items,
            payload.mainProductItemId
          ),
        })
    )
  ),
  /** Persist to localStorage after each event has updated state. */
  withEffects((store, events = inject(Events)) => ({
    persistOnCartEvents$: events
      .on(
        cartCatalogEvents.addFromBrowse,
        cartCatalogEvents.decrementItem,
        cartUiEvents.incrementItem,
        cartUiEvents.decrementOrRemoveItem,
        cartUiEvents.removeItem
      )
      .pipe(
        tap(() => persistItems(store.storage, store.platformId, store.items()))
      ),
  })),
  withHooks({
    onInit(store) {
      patchState(store, {
        items: loadGuestCartItems(store.storage, store.platformId),
      });
    },
  })
);
