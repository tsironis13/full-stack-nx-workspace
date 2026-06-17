import type { AuthorProfile } from '../domain/review.types';

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/**
 * Derives the author profile used for the snapshot from the Supabase
 * `req.user`. Reads common `user_metadata` name shapes and degrades to nulls
 * so the domain falls back to "Verified buyer".
 */
export function authorProfileFromRequestUser(user: unknown): AuthorProfile {
  const metadata =
    (user as { user_metadata?: Record<string, unknown> } | null)
      ?.user_metadata ?? {};

  return {
    firstName:
      readString(metadata['first_name']) ??
      readString(metadata['firstName']) ??
      readString(metadata['given_name']),
    lastName:
      readString(metadata['last_name']) ??
      readString(metadata['lastName']) ??
      readString(metadata['family_name']),
    fullName:
      readString(metadata['full_name']) ?? readString(metadata['name']),
  };
}
