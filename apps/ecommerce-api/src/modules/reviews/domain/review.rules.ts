import type { AuthorProfile } from './review.types';

export const MIN_RATING = 1;
export const MAX_RATING = 5;

const VERIFIED_BUYER_FALLBACK = 'Verified buyer';

/** A Rating is a whole number of stars between 1 and 5 inclusive. */
export function isValidRating(rating: number): boolean {
  return (
    Number.isInteger(rating) && rating >= MIN_RATING && rating <= MAX_RATING
  );
}

/**
 * Public author label snapshotted at submit/edit time: "First L." when a
 * usable name exists, otherwise "Verified buyer" so anonymity is preserved
 * without faking a name. Snapshotting means later profile renames do not
 * rewrite review history unless the author edits the review.
 */
export function computeAuthorDisplayName(profile: AuthorProfile): string {
  const first = profile.firstName?.trim();
  const last = profile.lastName?.trim();

  if (first) {
    return last ? `${first} ${lastInitial(last)}` : first;
  }

  const full = profile.fullName?.trim();
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]} ${lastInitial(parts[parts.length - 1])}`;
    }
    if (parts.length === 1) {
      return parts[0];
    }
  }

  return VERIFIED_BUYER_FALLBACK;
}

function lastInitial(lastName: string): string {
  return `${lastName.charAt(0).toUpperCase()}.`;
}
