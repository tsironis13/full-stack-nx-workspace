export class ProductReviewDto {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  authorDisplayName: string;
  createdAt: string;
}

export class ProductReviewsResponseDto {
  items: ProductReviewDto[];
  total: number;
  page: number;
  pageSize: number;
  averageRating: number | null;
  reviewCount: number;
}
