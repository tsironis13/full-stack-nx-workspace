import {
  catalogCardRatingAriaLabel,
  formatAverageRatingForDisplay,
} from './catalog-rating-display';

describe('catalog rating display', () => {
  it('rounds average rating to one decimal for display', () => {
    expect(formatAverageRatingForDisplay(3.6666666667)).toBe('3.7');
    expect(formatAverageRatingForDisplay(4)).toBe('4.0');
    expect(formatAverageRatingForDisplay(null)).toBeNull();
  });

  it('exposes accessible aggregate labels', () => {
    expect(catalogCardRatingAriaLabel(4.5, 2)).toBe(
      'Μέση βαθμολογία 4.5 από 5, 2 κριτικές',
    );
  });
});
