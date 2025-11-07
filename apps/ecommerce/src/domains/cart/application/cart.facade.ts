import { computed, inject, Injectable } from '@angular/core';

import { CartStore } from './cart.store';
import { CartItem } from '../domain/public-api';
import { CartItemViewModel } from './view-models/cart-item.view.model';

@Injectable()
export class CartFacade {
  readonly #cartStore = inject(CartStore);

  public readonly cartItemsViewModel = computed<CartItemViewModel[]>(() =>
    this.#cartStore.cartItems().map((cartItem: CartItem) => ({
      id: cartItem.id,
      name: cartItem.name,
      quantity: cartItem.quantity,
    }))
  );
}
