import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-cart-price-changed-line',
  templateUrl: './cart-price-changed-line.component.html',
  styleUrl: './cart-price-changed-line.component.scss',
  host: {
    class: 'cart-price-changed-line',
    '[class.cart-price-changed-line--compact]': 'density() === "compact"',
  },
  imports: [TranslocoPipe],
})
export class CartPriceChangedLineComponent {
  readonly formattedPrice = input.required<string>();

  /** Matches tighter layouts (e.g. cart drawer). */
  readonly density = input<'comfortable' | 'compact'>('comfortable');
}
