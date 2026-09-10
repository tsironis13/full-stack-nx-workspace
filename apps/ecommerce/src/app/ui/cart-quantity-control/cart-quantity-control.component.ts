import { Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ButtonDirective } from '@full-stack-nx-workspace/shared';

@Component({
  selector: 'app-cart-quantity-control',
  templateUrl: './cart-quantity-control.component.html',
  styleUrls: ['./cart-quantity-control.component.scss'],
  imports: [ButtonDirective, TranslocoPipe],
})
export class CartQuantityControlComponent {
  public readonly quantity = input.required<number>();

  public readonly addItemToCart = output<void>();
  public readonly removeItemFromCart = output<void>();
}
