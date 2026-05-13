import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { CheckoutStore } from '../application/public-api';

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
  private readonly router = inject(Router);

  protected readonly confirmedOrder = this.store.confirmedOrder;

  ngOnInit(): void {
    if (!this.store.isSuccess()) {
      this.router.navigate(['/checkout']);
    }
  }

  protected formatEur(amount: number): string {
    return formatEur(amount);
  }

  protected formatDate(isoString: string): string {
    return new Intl.DateTimeFormat('el-GR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(isoString));
  }
}
