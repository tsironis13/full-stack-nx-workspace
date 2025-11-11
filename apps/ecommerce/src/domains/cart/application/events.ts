import { type } from '@ngrx/signals';
import { event } from '@ngrx/signals/events';

export const addItemToCart = event(
  '[Shopping Cart] Add Item To Cart',
  type<number>() // product id
);

export const removeItemFromCart = event(
  '[Shopping Cart] Remove Item From Cart',
  type<number>() // product id
);
