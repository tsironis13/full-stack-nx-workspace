import { computed, inject, Injectable } from '@angular/core';

import { CartStore } from './cart.store';
import { CartItem } from '../domain/public-api';
import { CartItemViewModel } from './view-models/cart-item.view.model';

/**
 * Used only by the cart domain UI layer to transform the cart domain state into a UI view model.
 * Does not expose to world outside the cart domain.
 */
@Injectable({
  providedIn: 'root',
})
export class CartFacade {
  readonly #cartStore = inject(CartStore);

  public readonly cartItemsViewModel = computed<CartItemViewModel[]>(() =>
    this.#cartStore.cartItems().map((cartItem: CartItem) => ({
      id: cartItem.id,
      quantity: cartItem.quantity,
    }))
  );
}
