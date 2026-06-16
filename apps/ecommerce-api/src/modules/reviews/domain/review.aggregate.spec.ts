import {
  computeReviewAggregate,
  isVisibleReview,
} from './review.aggregate';

describe('review aggregate', () => {
  it('returns exact average and count for visible ratings', () => {
    expect(computeReviewAggregate([4, 5, 3])).toEqual({
      averageRating: 4,
      reviewCount: 3,
    });
  });

  it('preserves full precision for non-terminating averages', () => {
    expect(computeReviewAggregate([5, 4, 4])).toEqual({
      averageRating: 13 / 3,
      reviewCount: 3,
    });
  });

  it('returns null average and zero count when no ratings exist', () => {
    expect(computeReviewAggregate([])).toEqual({
      averageRating: null,
      reviewCount: 0,
    });
  });

  it('treats only rows without hiddenAt as visible', () => {
    expect(isVisibleReview(null)).toBe(true);
    expect(isVisibleReview(undefined)).toBe(true);
    expect(isVisibleReview(new Date())).toBe(false);
  });
});
