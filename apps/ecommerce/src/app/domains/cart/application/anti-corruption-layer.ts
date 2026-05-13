/**
 * **Cart bounded context — Anti-Corruption Layer (ACL)**
 *
 * This is the **only approved cross-domain surface** for the Cart context.
 *
 * - **Write side** — re-exported event groups:
 *   - `cartCatalogEvents`: Catalog → Cart commands (add from browse, decrement).
 *   - `cartUiEvents`: CartUI → Cart commands (increment, decrementOrRemove, remove).
 *   Foreign code dispatches these events; Cart's `GuestCartStore` reduces them.
 *   Callers must never import `GuestCartStore` or call its methods directly.
 *
 * - **Read side** — `CartAclReadAdapter`: an injectable service exposing narrow,
 *   stable computed signals (badge count, per-item quantities, items list,
 *   cart subtotal) without leaking the full `GuestCartStore` type to consumers.
 *
 * Boundary rule: `layout` and other `domain-application` layers may import from
 * this file; `domain-feature` code imports via its own domain's `public-api.ts`.
 */
export { CartAclReadAdapter } from './public-api';
export { cartCatalogEvents, cartUiEvents } from './public-api';
