import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { OrderHistoryStore } from '../application/public-api';

@Component({
  selector: 'app-order-history-page',
  templateUrl: './order-history.page.html',
  styleUrl: './order-history.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProgressSpinnerModule],
})
export class OrderHistoryPageComponent implements OnInit {
  protected readonly store = inject(OrderHistoryStore);

  ngOnInit(): void {
    this.store.load();
  }

  protected formatOrderDate(value: Date): string {
    return new Intl.DateTimeFormat('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(value);
  }

  protected formatAmount(value: number): string {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }
}
