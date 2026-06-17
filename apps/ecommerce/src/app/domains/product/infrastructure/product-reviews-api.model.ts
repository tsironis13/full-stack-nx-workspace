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
