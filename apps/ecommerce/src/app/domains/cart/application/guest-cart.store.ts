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

export const GuestCartStore = signalStore(
  { providedIn: 'root' },
  withState(emptyState),
  withProps(() => ({
    storage: inject(LocalStorageFacade),
    platformId: inject(PLATFORM_ID),
  })),
  withComputed(({ items }) => ({
    totalUnitCount: computed(() => items().reduce((sum, l) => sum + l.quantity, 0)),
  })),
  withMethods((store) => {
    const persist = (): void => {
      if (!isPlatformBrowser(store.platformId)) {
        return;
      }
      const envelope: ClientCartEnvelopeV1 = {
        schemaVersion: CLIENT_CART_SCHEMA_VERSION,
        items: store.items(),
      };
      store.storage.setJson(GUEST_CART_LOCAL_STORAGE_KEY, envelope);
    };

    return {
      addFromBrowseRow(row: CatalogBrowseCartAddInput, quantity = 1) {
        patchState(store, (s) => ({
          items: addOrMergeLines(s.items, row, quantity),
        }));
        persist();
      },
      incrementLine(mainProductItemId: number) {
        patchState(store, (s) => ({
          items: incrementLineQuantity(s.items, mainProductItemId),
        }));
        persist();
      },
      decrementLine(mainProductItemId: number) {
        patchState(store, (s) => ({
          items: decrementLineQuantityOrRemove(s.items, mainProductItemId),
        }));
        persist();
      },
      removeLine(mainProductItemId: number) {
        patchState(store, (s) => ({
          items: removeLineByMainProductItemId(s.items, mainProductItemId),
        }));
        persist();
      },
      /** Re-read persisted guest cart (tests / rare recovery). */
      rehydrateFromStorage() {
        patchState(store, {
          items: loadGuestCartItems(store.storage, store.platformId),
        });
      },
    };
  }),
  withHooks({
    onInit(store) {
      patchState(store, {
        items: loadGuestCartItems(store.storage, store.platformId),
      });
    },
  })
);
