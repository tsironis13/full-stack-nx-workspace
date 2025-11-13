import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cart-quantity-control',
  templateUrl: './cart-quantity-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule],
})
export class CartQuantityControlComponent {
  public readonly quantity = input.required<number>();

  public readonly addItemToCart = output<void>();
  public readonly removeItemFromCart = output<void>();
}
