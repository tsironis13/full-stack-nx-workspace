import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
} from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CartQuantityControlComponent } from '@full-stack-nx-workspace/shared';
import { injectDispatch } from '@ngrx/signals/events';

import {
  CartAclReadAdapter,
  cartUiEvents,
} from '../../domains/cart/application/anti-corruption-layer';
import { CartPriceChangedLineComponent } from '../../ui/cart/cart-price-changed-line/cart-price-changed-line.component';
import { CartUnavailableLineAlertComponent } from '../../ui/cart/cart-unavailable-line-alert/cart-unavailable-line-alert.component';

function formatEur(amount: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

@Component({
  selector: 'app-cart-drawer',
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DrawerModule,
    ButtonModule,
    ProgressSpinnerModule,
    CartQuantityControlComponent,
    CartUnavailableLineAlertComponent,
    CartPriceChangedLineComponent,
  ],
})
export class CartDrawerComponent {
  readonly visible = model<boolean>(false);

  protected readonly cartRead = inject(CartAclReadAdapter);
  private readonly dispatch = injectDispatch(cartUiEvents);
  private readonly router = inject(Router);

  protected readonly formattedSubtotal = computed(() =>
    formatEur(this.cartRead.cartSubtotal())
  );

  protected formatPrice(amount: number | null): string {
    return amount != null ? formatEur(amount) : '—';
  }

  protected lineSubtotal(
    salePrice: number | null,
    originalPrice: number | null,
    quantity: number
  ): string {
    return formatEur((salePrice ?? originalPrice ?? 0) * quantity);
  }

  protected onIncrement(mainProductItemId: number): void {
    this.dispatch.incrementItem({ mainProductItemId });
  }

  protected onDecrement(mainProductItemId: number): void {
    this.dispatch.decrementOrRemoveItem({ mainProductItemId });
  }

  protected onRemove(mainProductItemId: number): void {
    this.dispatch.removeItem({ mainProductItemId });
  }

  protected goToCart(): void {
    this.visible.set(false);
    this.router.navigate(['/cart']);
  }
}
