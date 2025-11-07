import { signalStore, withState } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

import { CartItem } from '../domain/public-api';
import { addItemToCart } from './events';

type State = { cartItems: CartItem[] };

export const CartStore = signalStore(
  withState<State>({ cartItems: [] }),
  withReducer(
    on(addItemToCart, ({ payload: productId }, state) => ({
      cartItems: [...state.cartItems, { id: productId, name: '', quantity: 1 }],
    }))
  )
);
