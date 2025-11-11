import { inject, Injectable } from '@angular/core';

import { CartStore } from './cart.store';

/**
 * CartUiAdapter
 *
 * Acts as an Anti-Corruption Layer (ACL) between the Cart domain
 * and presentation (UI/layout) layers used outside the cart domain.
 *
 * 👉 Purpose:
 *   - Expose a **read-only**, UI-friendly API derived from the Cart domain state.
 *   - Protect the Cart domain from direct access by UI components.
 *   - Simplify reactive bindings (signals) for components like the cart icon,
 *     product detail pages, or mini-cart overlays.
 *
 * 🔒 Rules:
 *   - Never mutate domain state directly here.
 *   - Only expose computed or mapped data derived from the domain store.
 *   - Use this adapter in UI or layout components instead of injecting CartStore.
 *
 * 🧩 Examples:
 *   - Header’s Cart Icon uses `totalItemsCount` to display cart badge.
 *   - Product cards use `getQuantitySignal(productId)` for live quantity display.
 */
@Injectable({
  providedIn: 'root',
})
export class CartUiAdapter {
  readonly #cartStore = inject(CartStore);

  public readonly totalItemsCount = this.#cartStore.totalItemsCount;
}
