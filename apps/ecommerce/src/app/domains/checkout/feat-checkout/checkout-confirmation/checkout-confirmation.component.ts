import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CheckoutStore } from '../../application/public-api';

function formatEur(amount: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

@Component({
  selector: 'app-checkout-confirmation',
  templateUrl: './checkout-confirmation.component.html',
  styleUrl: './checkout-confirmation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonModule],
})
export class CheckoutConfirmationComponent implements OnInit {
  private readonly store = inject(CheckoutStore);

  protected readonly confirmedOrder = this.store.confirmedOrder;
  protected readonly confirmedItems = this.store.confirmedItems;
  protected readonly confirmedShippingAddress = this.store.confirmedShippingAddress;
  protected readonly confirmedGuestEmail = this.store.confirmedGuestEmail;

  ngOnInit(): void {
    this.store.clearCart();
  }

  protected formatEur(amount: number): string {
    return formatEur(amount);
  }

  protected lineSubtotal(
    salePrice: number | null,
    originalPrice: number | null,
    quantity: number,
  ): string {
    return formatEur((salePrice ?? originalPrice ?? 0) * quantity);
  }

  protected formatDate(isoString: string): string {
    return new Intl.DateTimeFormat('el-GR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(isoString));
  }
}
