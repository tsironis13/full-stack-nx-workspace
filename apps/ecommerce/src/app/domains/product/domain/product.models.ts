export interface ProductReview {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  authorDisplayName: string;
  createdAt: Date;
}

export interface ProductReviewsPage {
  items: ProductReview[];
  total: number;
  page: number;
  pageSize: number;
  averageRating: number | null;
  reviewCount: number;
}

export interface MyReview {
  id: number;
  productId: number;
  rating: number;
  title: string | null;
  body: string | null;
  authorDisplayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDraft {
  rating: number;
  title: string | null;
  body: string | null;
}
