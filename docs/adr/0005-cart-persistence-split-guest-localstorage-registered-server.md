# Cart persistence: localStorage for Guest Users, server-side for Registered Users

Guest Users have no server identity, so their Cart is persisted in localStorage under a versioned envelope key (`ec.storefront.cart.guest.v1`). Registered Users have a server identity and need cross-device, cross-session Cart durability, so their Cart is stored server-side in `carts` / `cart_items` tables and accessed via a JWT-protected REST API.

When a Guest User signs in, their guest Cart Items are merged into the Registered User's server Cart (`POST /cart/merge`) and the localStorage cart is cleared on success. On logout the guest Cart is reset to empty — Registered User items do not leak back into an anonymous session.

## Considered Options

- **Always server-side (including guests):** Requires a guest session token and adds backend complexity for anonymous users who may never convert. Deferred until there is a concrete reason (e.g. cross-device guest persistence).
- **Always client-side (including registered users):** Loses the Cart on browser data clear or device switch. Incompatible with the domain rule that Registered Users persist Cart state across sessions.

## Consequences

- The front-end `CartStore` (unified, replaces `GuestCartStore`) must watch `AuthStore.isAuthenticated` and switch persistence strategy at runtime.
- A `401` from a cart API call is absorbed silently by `CartStore`; `AuthStore` owns the auth lifecycle and drives session resolution.
- `PlaceOrderUseCase` calls `ClearCartUseCase` (owned by `CartModule`, exported for `OrdersModule` to consume) atomically as part of Order creation — the client never drives the cart clear after checkout.
