import { inject } from '@angular/core';

import { ShoppingChatService } from '../../../core/shopping/public-api';
import { ShoppingStore } from '../application/public-api';
import { recommendedProductWidget } from '../feat-recommended-product/recommended-product.widget';

export const shoppingAgentWidgets = [recommendedProductWidget];

/** Eagerly construct ShoppingStore so A2UI confirm actions are subscribed before the first tap. */
export function initShoppingAssistant(): void {
  inject(ShoppingStore);
  inject(ShoppingChatService).init({ widgets: shoppingAgentWidgets });
}
