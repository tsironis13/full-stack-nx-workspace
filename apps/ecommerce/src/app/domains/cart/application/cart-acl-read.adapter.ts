import { computed, inject, Injectable } from '@angular/core';

import type { CatalogCartLineSnapshot } from '../domain/public-api';
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

  /**
   * Full list of **Cart Item** snapshots for display in the drawer and other
   * layout-level surfaces. The snapshot shape is stable across store refactors.
   */
  readonly items: () => CatalogCartLineSnapshot[] = this.store.items;

  /**
   * Cart-level subtotal: sum of `(salePrice ?? originalPrice ?? 0) × quantity`
   * across all **Cart Items**. Indicative only — no tax or shipping included.
   */
  readonly cartSubtotal = computed(() =>
    this.store
      .items()
      .reduce(
        (sum, l) => sum + (l.salePrice ?? l.originalPrice ?? 0) * l.quantity,
        0
      )
  );
}
