import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import {
  ButtonDirective,
  PaginatorComponent,
  SpinnerComponent,
  type PaginatorPageChange,
} from '@full-stack-nx-workspace/shared';
import { AuthStore } from '@full-stack-nx-workspace/auth-web';
import type { ReviewDraft } from '../application/public-api';
import {
  formatAverageRatingForDisplay,
  ProductDetailStore,
  ReviewSubmissionStore,
} from '../application/public-api';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgTemplateOutlet,
    ButtonDirective,
    PaginatorComponent,
    SpinnerComponent,
    TranslocoPipe,
  ],
})
export class ProductDetailPageComponent implements OnInit {
  readonly id = input.required<string>();
  protected readonly reviewPageSizeOptions = [5, 10, 20];

  protected readonly store = inject(ProductDetailStore);
  protected readonly submission = inject(ReviewSubmissionStore);
  protected readonly auth = inject(AuthStore);
  private readonly _transloco = inject(TranslocoService);

  private readonly fb = inject(FormBuilder);

  protected readonly editing = signal(false);

  protected readonly reviewForm = this.fb.nonNullable.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    title: [''],
    body: [''],
  });

  protected readonly aggregateLabel = computed(() => {
    const data = this.store.data();
    if (!data?.averageRating || data.reviewCount === 0) {
      return null;
    }
    return this._transloco.translate('product.aggregateAria', {
      average: formatAverageRatingForDisplay(data.averageRating),
      count: data.reviewCount,
    });
  });

  ngOnInit(): void {
    const productId = Number(this.id());
    if (!Number.isFinite(productId) || productId <= 0) {
      return;
    }
    this.store.load(productId);
    if (this.auth.isAuthenticated()) {
      this.submission.load(productId);
    }
  }

  protected selectRating(rating: number): void {
    this.reviewForm.controls.rating.setValue(rating);
    this.reviewForm.controls.rating.markAsTouched();
  }

  protected isRatingInvalid(): boolean {
    const control = this.reviewForm.controls.rating;
    return control.touched && control.invalid;
  }

  protected submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.submission.submit(this.draftFromForm());
    this.reviewForm.reset({ rating: 0, title: '', body: '' });
  }

  protected startEdit(): void {
    const review = this.submission.myReview();
    if (!review) {
      return;
    }
    this.reviewForm.reset({
      rating: review.rating,
      title: review.title ?? '',
      body: review.body ?? '',
    });
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
    this.reviewForm.reset({ rating: 0, title: '', body: '' });
  }

  protected saveEdit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.submission.edit(this.draftFromForm());
    this.editing.set(false);
  }

  protected deleteReview(): void {
    this.submission.remove();
  }

  private draftFromForm(): ReviewDraft {
    const { rating, title, body } = this.reviewForm.getRawValue();
    return {
      rating,
      title: title.trim() ? title.trim() : null,
      body: body.trim() ? body.trim() : null,
    };
  }

  protected reviewRatingAriaLabel(rating: number): string {
    return this._transloco.translate('product.reviewRatingAria', { rating });
  }

  protected formatReviewDate(value: Date): string {
    return new Intl.DateTimeFormat('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(value);
  }

  protected onPageChange({ page, pageSize }: PaginatorPageChange): void {
    this.store.applyPagination(page, pageSize);
  }

  protected stars(): readonly number[] {
    return [1, 2, 3, 4, 5];
  }

  protected isStarFilled(starIndex: number, rating: number): boolean {
    return starIndex <= rating;
  }
}
