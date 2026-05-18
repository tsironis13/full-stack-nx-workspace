import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CartQuantityControlComponent } from '@full-stack-nx-workspace/shared';

import { CartStore } from '../application/public-api';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonModule,
    ProgressSpinnerModule,
    CartQuantityControlComponent,
  ],
})
export class CartPageComponent {
  protected readonly store = inject(CartStore);

  protected readonly cartSubtotal = computed(() =>
    this.store
      .items()
      .reduce(
        (sum, l) => sum + (l.salePrice ?? l.originalPrice ?? 0) * l.quantity,
        0,
      ),
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
    this.store.incrementLine(mainProductItemId);
  }

  protected onDecrement(mainProductItemId: number): void {
    this.store.decrementLine(mainProductItemId);
  }

  protected onRemove(mainProductItemId: number): void {
    this.store.removeLine(mainProductItemId);
  }
}
