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
