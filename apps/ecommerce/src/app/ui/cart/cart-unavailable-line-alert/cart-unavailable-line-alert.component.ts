import { Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ButtonDirective } from '@full-stack-nx-workspace/shared';

@Component({
  selector: 'app-cart-unavailable-line-alert',
  templateUrl: './cart-unavailable-line-alert.component.html',
  styleUrl: './cart-unavailable-line-alert.component.scss',
  host: {
    class: 'cart-unavailable-line-alert',
    '[class.cart-unavailable-line-alert--compact]': 'density() === "compact"',
  },
  imports: [ButtonDirective, TranslocoPipe],
})
export class CartUnavailableLineAlertComponent {
  /** Matches tighter layouts (e.g. cart drawer). */
  readonly density = input<'comfortable' | 'compact'>('comfortable');

  readonly remove = output<void>();
}
