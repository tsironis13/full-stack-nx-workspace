import {
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { computed } from '@angular/core';

import { CartItem } from '../domain/public-api';
import { addItemToCart, removeItemFromCart } from './events';

type State = { cartItems: CartItem[] };

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState<State>({ cartItems: [] }),
  withComputed(({ cartItems }) => ({
    totalItemsCount: computed(() =>
      cartItems().reduce((acc, cartItem) => acc + cartItem.quantity, 0)
    ),
  })),
  withMethods(({ cartItems }) => ({
    getQuantityByProductId: (productId: number) => {
      console.log('getQuantityByProductId called with productId: ', productId);
      return computed(
        () => cartItems().find((i) => i.id === productId)?.quantity ?? 0
      );
    },
  })),
  withReducer(
    on(addItemToCart, ({ payload: productId }, state) => {
      const existingCartItem = state.cartItems.find(
        (cartItem) => cartItem.id === productId
      );

      if (existingCartItem) {
        return {
          cartItems: state.cartItems.map((cartItem) =>
            cartItem.id === productId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        };
      }
      return {
        cartItems: [...state.cartItems, { id: productId, quantity: 1 }],
      };
    }),
    on(removeItemFromCart, ({ payload: productId }, state) => {
      return {
        cartItems: state.cartItems.map((cartItem) =>
          cartItem.id === productId && cartItem.quantity > 0
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        ),
      };
    })
  )
);
