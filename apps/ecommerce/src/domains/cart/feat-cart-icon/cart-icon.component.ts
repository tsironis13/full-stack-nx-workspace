import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CartStore, CartFacade } from '../application/public-api';

@Component({
  selector: 'app-cart-icon',
  templateUrl: './cart-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CartFacade, CartStore],
})
export class CartIconComponent {
  protected readonly cartFacade = inject(CartFacade);
}
