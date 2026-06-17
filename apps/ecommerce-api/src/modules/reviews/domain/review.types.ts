export interface ProductReviewSummary {
  averageRating: number | null;
  reviewCount: number;
}

export interface ProductReviewListItem {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  authorDisplayName: string;
  createdAt: Date;
}

export interface ProductReviewPage {
  items: ProductReviewListItem[];
  total: number;
  summary: ProductReviewSummary;
}

export type ReviewHiddenBy = 'author' | 'admin';

/** Full persisted review row, including author + moderation fields. */
export interface ReviewRecord {
  id: number;
  productId: number;
  userId: string;
  rating: number;
  title: string | null;
  body: string | null;
  authorDisplayName: string;
  hiddenAt: Date | null;
  hiddenBy: ReviewHiddenBy | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Minimal Registered User profile fields used to snapshot the author label. */
export interface AuthorProfile {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
}
