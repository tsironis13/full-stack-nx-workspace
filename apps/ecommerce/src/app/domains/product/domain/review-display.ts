/** Storefront display: one decimal rounded from the exact average. */
export function formatAverageRatingForDisplay(
  averageRating: number | null,
): string | null {
  if (averageRating == null) {
    return null;
  }

  return (Math.round(averageRating * 10) / 10).toFixed(1);
}

/** Accessible label for a single review star score. */
export function reviewRatingAriaLabel(rating: number): string {
  return `${rating} από 5 αστέρια`;
}

/** Accessible label for aggregate score on the product page. */
export function aggregateRatingAriaLabel(
  averageRating: number,
  reviewCount: number,
): string {
  const display = formatAverageRatingForDisplay(averageRating);
  return `Μέση βαθμολογία ${display} από 5, ${reviewCount} κριτικές`;
}
