import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  aggregateRatingAriaLabel,
  ProductDetailStore,
  reviewRatingAriaLabel,
} from '../application/public-api';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PaginatorModule, ProgressSpinnerModule],
})
export class ProductDetailPageComponent implements OnInit {
  readonly id = input.required<string>();

  protected readonly store = inject(ProductDetailStore);

  protected readonly reviewRatingAriaLabel = reviewRatingAriaLabel;

  protected readonly aggregateLabel = computed(() => {
    const data = this.store.data();
    if (!data?.averageRating || data.reviewCount === 0) {
      return null;
    }
    return aggregateRatingAriaLabel(data.averageRating, data.reviewCount);
  });

  ngOnInit(): void {
    const productId = Number(this.id());
    if (!Number.isFinite(productId) || productId <= 0) {
      return;
    }
    this.store.load(productId);
  }

  protected formatReviewDate(value: Date): string {
    return new Intl.DateTimeFormat('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(value);
  }

  protected onPageChange(state: PaginatorState): void {
    const nextPage = (state.page ?? 0) + 1;
    const rows = state.rows ?? this.store.pageSize();
    this.store.applyPagination(nextPage, rows);
  }

  protected stars(): readonly number[] {
    return [1, 2, 3, 4, 5];
  }

  protected isStarFilled(starIndex: number, rating: number): boolean {
    return starIndex <= rating;
  }
}
