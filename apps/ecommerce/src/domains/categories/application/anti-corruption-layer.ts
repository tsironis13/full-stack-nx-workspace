import { inject, Injectable } from '@angular/core';

import { CategoriesStore } from './public-api';
/** Anti Corruption Layer for the categories domain
 * It is the external interface for the categories domain, not the internal interface for the categories domain
 * Exposes stuff that are needed by other domains like the products domain
 * Domains can communicate with each other only through the anti-corruption layer
 */

/**
 * CategoriesUiAdapter
 *
 * Acts as an Anti-Corruption Layer (ACL) between the Categories domain
 * and presentation (UI/layout) layers used outside the categories domain.
 *
 * 👉 Purpose:
 *   - Expose a **read-only**, UI-friendly API derived from the Categories domain state.
 *   - Protect the Categories domain from direct access by UI components.
 *   - Simplify reactive bindings (signals) for components like the categories filters.
 *
 * 🔒 Rules:
 *   - Never mutate domain state directly here.
 *   - Only expose computed or mapped data derived from the domain store.
 *   - Use this adapter in UI or layout components instead of injecting CategoriesStore.
 *
 * 🧩 Examples:
 *   - Categories filters use `categoryAttributeValues` to display the categories filters.
 */
@Injectable({
  providedIn: 'root',
})
export class CategoriesUiAdapter {
  readonly #categoriesStore = inject(CategoriesStore);

  public readonly getCategoryFiltersGroupedByAttributeValuesById =
    this.#categoriesStore.getCategoryFiltersGroupedByAttributeValuesById;

  public readonly categoryFilters = this.#categoriesStore.categoryFilters;
}
