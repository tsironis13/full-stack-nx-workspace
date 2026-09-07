import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { type AngularToolCall, type ToolRenderer } from '@copilotkit/angular';
import { z } from 'zod';

import { createFrontendTool } from '@full-stack-nx-workspace/shared';
import {
  notifyRecommendationTurn,
  ShoppingStore,
} from '../application/public-api';

const recommendedProductSchema = z.object({
  id: z.number().describe("The Product id from this turn's search results"),
  name: z.string().describe('The Product name; do not translate'),
  price: z.number().describe('Sale Price on the Main Product Item'),
});

const recommendedProductWidgetSchema = z.object({
  product: recommendedProductSchema,
});

type RecommendedProductWidgetArgs = z.infer<
  typeof recommendedProductWidgetSchema
>;

@Component({
  selector: 'app-recommended-product-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './recommended-product.widget.html',
  styleUrl: './recommended-product.widget.scss',
})
export class RecommendedProductWidget implements ToolRenderer<RecommendedProductWidgetArgs> {
  readonly toolCall =
    input.required<AngularToolCall<RecommendedProductWidgetArgs>>();

  private readonly shoppingStore = inject(ShoppingStore);

  protected addToCart(): void {
    const product = this.toolCall().args.product;
    if (!product) {
      return;
    }
    this.shoppingStore.startFromRecommendation(product.id);
  }
}

export const recommendedProductWidget = createFrontendTool({
  name: 'recommendedProductWidget',
  description: `
    Displays one Product recommendation as an interactive card in the chat.

    Call once per Product you recommend, only after search results for this turn are available. Pass only Products from those results. At most 3 calls per shopper turn.

    Remarks:
    - Use this for Product recommendations from a product need. Do not use it for catalog name search (that takes the shopper to the catalog page).
    - product.id is the Product id, product.name is the Product name (do not translate), product.price is the Sale Price on the Main Product Item.
    - Do not invent a Product or reuse a Product from an earlier turn as if it were a new search.
    - Do not announce this tool call before executing it. The UI already shows the card.
    - Do not also list Products as markdown links or a text catalog; the cards are the Product list.
    - If no Product is an honest fit, do not call this tool.
  `,
  parameters: recommendedProductWidgetSchema,
  component: RecommendedProductWidget,
  followUp: false,
  handler: async () => {
    notifyRecommendationTurn();
    return { shown: true };
  },
});
