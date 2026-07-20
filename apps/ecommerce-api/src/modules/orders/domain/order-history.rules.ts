export interface OrderItemReviewStatus {
  canReview: boolean;
  hasReview: boolean;
  reviewId: number | null;
}

/**
 * Derives the per-line review status surfaced by GET /orders.
 *
 * Every order-history line originates from a `confirmed` Order belonging to the
 * Registered User, which is exactly the verified-purchase condition enforced on
 * the product page — so the Product is always eligible (`canReview` is true).
 * The CTA then differs by whether a visible Review already exists: `hasReview`
 * drives "Edit review" vs "Write a review", honoring one-review-per-product.
 */
export function deriveOrderItemReviewStatus(
  visibleReviewId: number | null,
): OrderItemReviewStatus {
  return {
    canReview: true,
    hasReview: visibleReviewId !== null,
    reviewId: visibleReviewId,
  };
}
