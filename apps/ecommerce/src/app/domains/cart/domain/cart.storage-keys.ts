/**
 * **Guest User** cart persistence key. **Registered User** carts should use a
 * separate key (e.g. `ec.storefront.cart.user.<authUserId>.v1`) when auth merges
 * land — never share guest and registered payloads under one key.
 */
export const GUEST_CART_LOCAL_STORAGE_KEY = 'ec.storefront.cart.guest.v1';
