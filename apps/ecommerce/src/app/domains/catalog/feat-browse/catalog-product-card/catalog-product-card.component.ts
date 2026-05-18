import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { injectDispatch } from '@ngrx/signals/events';

import {
  CartAclReadAdapter,
  cartCatalogEvents,
  type CatalogListItem,
} from '../../application/public-api';

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240"><rect width="320" height="240" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="system-ui" font-size="14">Εικόνα</text></svg>'
  );

@Component({
  selector: 'app-catalog-product-card',
  templateUrl: './catalog-product-card.component.html',
  styleUrl: './catalog-product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ProgressSpinnerModule],
})
export class CatalogProductCardComponent {
  readonly item = input.required<CatalogListItem>();

  protected readonly placeholderImage = PLACEHOLDER_IMAGE;

  private readonly cartRead = inject(CartAclReadAdapter);
  private readonly dispatch = injectDispatch(cartCatalogEvents);

  /** True only for this card while its line is syncing with the server (auth mode). */
  protected readonly lineServerMutationPending = computed(
    () =>
      this.cartRead.pendingMainProductItemId() === this.item().mainProductItemId,
  );

  /** Current quantity of this card's Main Product Item in the cart (0 = not in cart). */
  protected readonly cartQuantity = computed(
    () => this.cartRead.itemQuantities().get(this.item().mainProductItemId) ?? 0,
  );

  protected onImageError(event: Event): void {
    const el = event.target;
    if (el instanceof HTMLImageElement) {
      el.src = this.placeholderImage;
    }
  }

  protected onAddToCart(): void {
    const { productId, mainProductItemId, name, salePrice, originalPrice, primaryImageUrl } =
      this.item();
    this.dispatch.addFromBrowse({ productId, mainProductItemId, name, salePrice, originalPrice, primaryImageUrl });
  }

  protected onDecrementFromCart(): void {
    this.dispatch.decrementItem({ mainProductItemId: this.item().mainProductItemId });
  }
}
