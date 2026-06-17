import {
  formatAverageRatingForDisplay,
  reviewRatingAriaLabel,
} from './review-display';

describe('review display', () => {
  it('rounds average rating to one decimal for display', () => {
    expect(formatAverageRatingForDisplay(3.6666666667)).toBe('3.7');
    expect(formatAverageRatingForDisplay(4)).toBe('4.0');
    expect(formatAverageRatingForDisplay(null)).toBeNull();
  });

  it('exposes accessible star labels', () => {
    expect(reviewRatingAriaLabel(4)).toBe('4 από 5 αστέρια');
  });
});
