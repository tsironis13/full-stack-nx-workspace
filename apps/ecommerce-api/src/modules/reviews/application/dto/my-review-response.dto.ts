export class MyReviewResponseDto {
  id: number;
  productId: number;
  rating: number;
  title: string | null;
  body: string | null;
  authorDisplayName: string;
  createdAt: string;
  updatedAt: string;
}
