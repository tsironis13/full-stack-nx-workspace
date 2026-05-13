import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

import type { CatalogBrowseCartAddInput } from '../domain/public-api';

/**
 * Events dispatched by **Catalog** (and any other external bounded context) to
 * mutate **Cart** state. Defined here so **Cart** owns the write contract; the
 * ACL re-exports them as the only approved foreign-facing surface.
 */
export const cartCatalogEvents = eventGroup({
  source: 'Catalog',
  events: {
    /** Add (or merge into existing) a **Main Product Item** line from a catalog browse row. */
    addFromBrowse: type<CatalogBrowseCartAddInput>(),
    /** Decrement the quantity of a **Cart Item** by 1; removes line when qty reaches 1. */
    decrementItem: type<{ mainProductItemId: number }>(),
  },
});

/**
 * Events dispatched by **Cart UI surfaces** (drawer, cart page via layout shell)
 * to mutate **Cart** state. The ACL re-exports these so that layout-level
 * components can dispatch them without importing `GuestCartStore` directly.
 */
export const cartUiEvents = eventGroup({
  source: 'CartUI',
  events: {
    /** Increment the quantity of a **Cart Item** by 1. */
    incrementItem: type<{ mainProductItemId: number }>(),
    /** Decrement the quantity of a **Cart Item** by 1; removes line when qty reaches 1. */
    decrementOrRemoveItem: type<{ mainProductItemId: number }>(),
    /** Remove a **Cart Item** line entirely regardless of quantity. */
    removeItem: type<{ mainProductItemId: number }>(),
    /** Clear all **Cart Items** — used by Checkout after a successful order. */
    clearCart: type<void>(),
  },
});
