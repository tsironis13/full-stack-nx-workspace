import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import { type AngularToolCall, type ToolRenderer } from '@copilotkit/angular';
import { z } from 'zod';

import { createFrontendTool } from '@full-stack-nx-workspace/shared';

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
  imports: [JsonPipe],
  template: `
    @let product = toolCall().args.product;
    {{ product | json }}
    <!-- @if (flight) {
      @let status = toolCall().args.status ?? 'other';
      <app-flight-card
        [item]="flight"
        [selected]="isSelected(flight.id)"
        [readonly]="true"
      >
        @if (status === 'booked') {
          <button
            class="btn btn-default"
            [routerLink]="['/checkin', { ticketId: flight.id }]"
          >
            Check in
          </button>
        } @else if (status === 'other') {
          @if (isSelected(flight.id)) {
            <button class="btn btn-default" (click)="select(flight.id, false)">
              Remove
            </button>
          } @else {
            <button class="btn btn-default" (click)="select(flight.id, true)">
              Select
            </button>
          }
        }
      </app-flight-card>
    } -->
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class RecommendedProductWidget
  implements ToolRenderer<RecommendedProductWidgetArgs>, OnInit
{
  readonly toolCall =
    input.required<AngularToolCall<RecommendedProductWidgetArgs>>();

  ngOnInit(): void {
    console.log('RecommendedProductWidget', this.toolCall());
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
  handler: async () => ({ shown: true }),
});
