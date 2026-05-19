import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cart-unavailable-line-alert',
  templateUrl: './cart-unavailable-line-alert.component.html',
  styleUrl: './cart-unavailable-line-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cart-unavailable-line-alert',
    '[class.cart-unavailable-line-alert--compact]': 'density() === "compact"',
  },
  imports: [ButtonModule],
})
export class CartUnavailableLineAlertComponent {
  /** Matches tighter layouts (e.g. cart drawer). */
  readonly density = input<'comfortable' | 'compact'>('comfortable');

  readonly remove = output<void>();
}
