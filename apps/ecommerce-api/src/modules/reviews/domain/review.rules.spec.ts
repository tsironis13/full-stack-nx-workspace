import { computeAuthorDisplayName, isValidRating } from './review.rules';

describe('review.rules', () => {
  describe('isValidRating', () => {
    it.each([1, 2, 3, 4, 5])('accepts whole star rating %i', (rating) => {
      expect(isValidRating(rating)).toBe(true);
    });

    it.each([0, 6, -1, 10])('rejects out-of-range rating %i', (rating) => {
      expect(isValidRating(rating)).toBe(false);
    });

    it.each([1.5, 4.9, Number.NaN])(
      'rejects non-integer rating %p',
      (rating) => {
        expect(isValidRating(rating)).toBe(false);
      },
    );
  });

  describe('computeAuthorDisplayName', () => {
    it('renders "First L." from first and last name', () => {
      expect(
        computeAuthorDisplayName({ firstName: 'Kate', lastName: 'Robinson' }),
      ).toBe('Kate R.');
    });

    it('renders just the first name when no last name exists', () => {
      expect(computeAuthorDisplayName({ firstName: 'Kate' })).toBe('Kate');
    });

    it('derives first + last initial from a full name', () => {
      expect(computeAuthorDisplayName({ fullName: 'Maria Anna Papadopoulou' })).toBe(
        'Maria P.',
      );
    });

    it('falls back to "Verified buyer" when no usable name exists', () => {
      expect(computeAuthorDisplayName({})).toBe('Verified buyer');
      expect(
        computeAuthorDisplayName({ firstName: '   ', lastName: '   ' }),
      ).toBe('Verified buyer');
    });
  });
});
