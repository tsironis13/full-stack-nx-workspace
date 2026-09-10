import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { injectDispatch } from '@ngrx/signals/events';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  ButtonDirective,
  SpinnerComponent,
} from '@full-stack-nx-workspace/shared';
import {
  CartUnavailableLineAlertComponent,
  CartPriceChangedLineComponent,
  CartQuantityControlComponent,
} from '../../../ui/public-api';
import { CartStore, cartUiEvents } from '../application/public-api';

function formatEur(amount: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
  imports: [
    RouterLink,
    ButtonDirective,
    SpinnerComponent,
    CartQuantityControlComponent,
    CartUnavailableLineAlertComponent,
    CartPriceChangedLineComponent,
    TranslocoPipe,
  ],
})
export class CartPageComponent {
  protected readonly store = inject(CartStore);
  private readonly _dispatch = injectDispatch(cartUiEvents);
  private readonly _router = inject(Router);

  protected readonly cartSubtotal = computed(() =>
    this.store
      .items()
      .reduce(
        (sum, l) => sum + (l.salePrice ?? l.originalPrice ?? 0) * l.quantity,
        0,
      ),
  );

  protected readonly hasUnavailableItems = computed(() =>
    this.store.items().some((item) => item.available === false),
  );

  protected readonly checkoutBlocked = computed(
    () =>
      this.store.items().length === 0 ||
      this.store.pendingMainProductItemId() !== null ||
      this.hasUnavailableItems(),
  );

  protected lineSubtotal(
    salePrice: number | null,
    originalPrice: number | null,
    quantity: number,
  ): string {
    return formatEur((salePrice ?? originalPrice ?? 0) * quantity);
  }

  protected formatPrice(amount: number | null): string {
    return amount != null ? formatEur(amount) : '—';
  }

  protected formattedSubtotal = computed(() => formatEur(this.cartSubtotal()));

  protected onIncrement(mainProductItemId: number): void {
    this._dispatch.incrementItem({ mainProductItemId });
  }

  protected onDecrement(mainProductItemId: number): void {
    this._dispatch.decrementOrRemoveItem({ mainProductItemId });
  }

  protected onRemove(mainProductItemId: number): void {
    this._dispatch.removeItem({ mainProductItemId });
  }

  protected goToCheckout(): void {
    if (this.checkoutBlocked()) {
      return;
    }
    void this._router.navigate(['/checkout']);
  }
}
