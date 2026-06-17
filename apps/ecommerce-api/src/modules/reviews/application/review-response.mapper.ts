import type { ReviewRecord } from '../domain/review.types';
import { MyReviewResponseDto } from './dto/my-review-response.dto';

export function toMyReviewResponse(review: ReviewRecord): MyReviewResponseDto {
  return {
    id: review.id,
    productId: review.productId,
    rating: review.rating,
    title: review.title,
    body: review.body,
    authorDisplayName: review.authorDisplayName,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}
