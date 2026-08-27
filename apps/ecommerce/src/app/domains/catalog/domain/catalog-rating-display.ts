/** Storefront display: one decimal rounded from the exact average. */
export function formatAverageRatingForDisplay(
  averageRating: number | null,
): string | null {
  if (averageRating == null) {
    return null;
  }

  return (Math.round(averageRating * 10) / 10).toFixed(1);
}

/** Accessible label for aggregate score on catalog cards. */
export function catalogCardRatingAriaLabel(
  averageRating: number,
  reviewCount: number,
): string {
  const display = formatAverageRatingForDisplay(averageRating);
  return `Μέση βαθμολογία ${display} από 5, ${reviewCount} κριτικές`;
}
