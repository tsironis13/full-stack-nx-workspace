import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { injectDispatch } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AuthStore } from '@full-stack-nx-workspace/auth-web';

import {
  CartAclReadAdapter,
  cartUiEvents,
} from '../../cart/application/anti-corruption-layer';
import { CheckoutApiService } from '../infrastructure/public-api';
import type {
  ConfirmedOrderItemWire,
  PlaceOrderResponseWire,
  ShippingAddressWire,
} from '../infrastructure/public-api';

export type CheckoutStatus = 'idle' | 'submitting' | 'success' | 'error';

export type PlaceOrderParams = {
  guestEmail?: string;
  shippingAddress: ShippingAddressWire;
};

type CheckoutState = {
  status: CheckoutStatus;
  error: string | null;
  confirmedOrder: PlaceOrderResponseWire | null;
  /** Snapshot of cart lines captured at submission time, before cart is cleared. */
  confirmedItems: ConfirmedOrderItemWire[] | null;
  /** Shipping address captured at submission time. */
  confirmedShippingAddress: ShippingAddressWire | null;
  /** Guest email captured at submission time; null for authenticated users. */
  confirmedGuestEmail: string | null;
};

const initialState: CheckoutState = {
  status: 'idle',
  error: null,
  confirmedOrder: null,
  confirmedItems: null,
  confirmedShippingAddress: null,
  confirmedGuestEmail: null,
};

export const CheckoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    cartAcl: inject(CartAclReadAdapter),
  })),
  withComputed((store) => ({
    isSubmitting: computed(() => store.status() === 'submitting'),
    isSuccess: computed(() => store.status() === 'success'),
    /** Cart items forwarded for the checkout view — read via ACL, not GuestCartStore. */
    cartItems: computed(() => store.cartAcl.items()),
    /** Cart subtotal forwarded for the checkout view. */
    cartSubtotal: computed(() => store.cartAcl.cartSubtotal()),
  })),
  withMethods((store) => {
    const apiService = inject(CheckoutApiService);
    const authStore = inject(AuthStore);
    const dispatch = injectDispatch(cartUiEvents);

    const submitOrder = rxMethod<PlaceOrderParams>(
      pipe(
        tap(() => patchState(store, { status: 'submitting', error: null })),
        switchMap((params) => {
          const cartLines = store.cartAcl.items();
          const items = cartLines.map((line) => ({
            productItemId: line.mainProductItemId,
            quantity: line.quantity,
          }));
          const itemsSnapshot: ConfirmedOrderItemWire[] = cartLines.map(
            (line) => ({
              name: line.name,
              quantity: line.quantity,
              salePrice: line.salePrice,
              originalPrice: line.originalPrice,
            }),
          );

          const authToken = authStore.isAuthenticated()
            ? (authStore.session()?.accessToken ?? undefined)
            : undefined;

          const guestEmail =
            params.guestEmail && !authStore.isAuthenticated()
              ? params.guestEmail
              : undefined;

          const body = {
            ...(guestEmail ? { guestEmail } : {}),
            shippingAddress: params.shippingAddress,
            items,
          };

          return apiService.createOrder(body, authToken).pipe(
            tapResponse({
              next: (confirmedOrder) =>
                patchState(store, {
                  status: 'success',
                  confirmedOrder,
                  confirmedItems: itemsSnapshot,
                  confirmedShippingAddress: params.shippingAddress,
                  confirmedGuestEmail: guestEmail ?? null,
                  error: null,
                }),
              error: (err: unknown) =>
                patchState(store, {
                  status: 'error',
                  error:
                    err instanceof Error
                      ? err.message
                      : 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.',
                }),
            }),
          );
        }),
      ),
    );

    return {
      placeOrder: (params: PlaceOrderParams) => submitOrder(params),
      resetStatus: () => patchState(store, { status: 'idle', error: null }),
      /** Dispatch cartUiEvents.clearCart via the ACL — does not import GuestCartStore. */
      clearCart: () => dispatch.clearCart(),
    };
  }),
);
