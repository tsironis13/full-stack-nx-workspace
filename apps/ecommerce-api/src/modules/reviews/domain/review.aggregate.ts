import type { ProductReviewSummary } from './review.types';

/** Exact average across visible review ratings; null when there are none. */
export function computeReviewAggregate(
  ratings: readonly number[],
): ProductReviewSummary {
  if (ratings.length === 0) {
    return { averageRating: null, reviewCount: 0 };
  }

  const sum = ratings.reduce((total, rating) => total + rating, 0);

  return {
    averageRating: sum / ratings.length,
    reviewCount: ratings.length,
  };
}

/** Non-hidden reviews only — hidden rows must be filtered before calling. */
export function isVisibleReview(hiddenAt: Date | null | undefined): boolean {
  return hiddenAt == null;
}
