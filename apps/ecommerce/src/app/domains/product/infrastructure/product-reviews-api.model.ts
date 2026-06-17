export interface ProductReviewWire {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  authorDisplayName: string;
  createdAt: string;
}

export interface ProductReviewsPageWire {
  items: ProductReviewWire[];
  total: number;
  page: number;
  pageSize: number;
  averageRating: number | null;
  reviewCount: number;
}

export interface MyReviewWire {
  id: number;
  productId: number;
  rating: number;
  title: string | null;
  body: string | null;
  authorDisplayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitReviewRequestWire {
  rating: number;
  title?: string;
  body?: string;
}

export interface EditReviewRequestWire {
  rating?: number;
  title?: string;
  body?: string;
}
