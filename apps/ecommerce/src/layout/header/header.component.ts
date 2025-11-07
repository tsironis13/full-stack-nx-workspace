import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CartIconComponent } from '../../domains/cart/feat-cart-icon/cart-icon.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CartIconComponent],
})
export class HeaderComponent {}
