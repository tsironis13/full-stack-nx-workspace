import { computed, inject, Injectable } from '@angular/core';

import { GuestCartStore } from './guest-cart.store';

/**
 * Narrow read surface exposed by the **Cart** bounded context for foreign
 * consumers. Hides `GuestCartStore` internals behind stable, curated signals.
 *
 * Import exclusively via `domains/cart/application/anti-corruption-layer.ts`.
 */
@Injectable({ providedIn: 'root' })
export class CartAclReadAdapter {
  private readonly store = inject(GuestCartStore);

  /** Sum of all **Cart Item** quantities; drives the header badge. */
  readonly totalUnitCount = this.store.totalUnitCount;

  /**
   * Map of `mainProductItemId → quantity` for the current cart snapshot.
   * Recomputes whenever any cart item changes; cards use `get(id) ?? 0`.
   */
  readonly itemQuantities = computed(() => {
    const m = new Map<number, number>();
    for (const line of this.store.items()) {
      m.set(line.mainProductItemId, line.quantity);
    }
    return m;
  });
}
