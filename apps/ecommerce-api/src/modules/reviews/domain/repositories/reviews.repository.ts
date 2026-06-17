import type { ProductReviewPage, ReviewRecord } from '../review.types';

export abstract class ReviewsRepository {
  abstract productExists(productId: number): Promise<boolean>;

  abstract findVisibleReviewsPage(params: {
    productId: number;
    page: number;
    pageSize: number;
  }): Promise<ProductReviewPage>;

  /** Returns the single review for this user+product, hidden or not, or null. */
  abstract findByUserAndProduct(params: {
    userId: string;
    productId: number;
  }): Promise<ReviewRecord | null>;

  abstract createReview(params: {
    productId: number;
    userId: string;
    rating: number;
    title: string | null;
    body: string | null;
    authorDisplayName: string;
  }): Promise<ReviewRecord>;

  /**
   * Updates content/snapshot of an existing review. When `reactivate` is true
   * the soft-hide markers are cleared so a previously author-deleted review is
   * brought back via the same row (honoring the unique index).
   */
  abstract updateReview(params: {
    id: number;
    rating: number;
    title: string | null;
    body: string | null;
    authorDisplayName: string;
    reactivate: boolean;
  }): Promise<ReviewRecord>;

  /** Soft-hides a review (excluded from list + aggregate), retaining the row. */
  abstract hideReview(params: {
    id: number;
    hiddenBy: 'author' | 'admin';
  }): Promise<ReviewRecord>;
}
