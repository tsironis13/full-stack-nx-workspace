import { Injectable } from '@angular/core';
import { injectDispatch } from '@ngrx/signals/events';

import { cartShoppingEvents } from '../../cart/application/anti-corruption-layer';
import {
  interpretConfirmSubmit,
  type ConfirmSubmitDecision,
} from '../domain/public-api';

/**
 * Confirm `submitAnswer` → Cart ACL event. Shopping never imports `CartStore`.
 */
@Injectable({ providedIn: 'root' })
export class CartItemConfirmHandler {
  private readonly dispatch = injectDispatch(cartShoppingEvents);

  apply(context: Record<string, unknown>): ConfirmSubmitDecision {
    const decision = interpretConfirmSubmit(context);
    if (decision.kind === 'add') {
      this.dispatch.addProductItem(decision.payload);
    }
    return decision;
  }
}
