import { deriveOrderItemReviewStatus } from './order-history.rules';

describe('deriveOrderItemReviewStatus', () => {
  it('marks a confirmed-order line item as eligible to review', () => {
    expect(deriveOrderItemReviewStatus(null).canReview).toBe(true);
  });

  it('reports no review when there is no visible review id', () => {
    expect(deriveOrderItemReviewStatus(null)).toEqual({
      canReview: true,
      hasReview: false,
      reviewId: null,
    });
  });

  it('reports an existing review when a visible review id is present', () => {
    expect(deriveOrderItemReviewStatus(42)).toEqual({
      canReview: true,
      hasReview: true,
      reviewId: 42,
    });
  });
});
