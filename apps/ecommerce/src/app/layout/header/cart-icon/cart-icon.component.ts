import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CartUiAdapter } from '../../../domains/cart/application/anti-corruption-layer';

@Component({
  selector: 'app-cart-icon',
  templateUrl: './cart-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartIconComponent {
  protected readonly cartUiAdapter = inject(CartUiAdapter);
}
