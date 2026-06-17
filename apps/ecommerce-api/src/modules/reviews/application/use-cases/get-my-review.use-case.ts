import { Injectable, NotFoundException } from '@nestjs/common';

import { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import { MyReviewResponseDto } from '../dto/my-review-response.dto';
import { toMyReviewResponse } from '../review-response.mapper';

export interface GetMyReviewQuery {
  productId: number;
  userId: string;
}

@Injectable()
export class GetMyReviewUseCase {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async execute(query: GetMyReviewQuery): Promise<MyReviewResponseDto> {
    const existing = await this.reviewsRepository.findByUserAndProduct({
      userId: query.userId,
      productId: query.productId,
    });

    if (!existing || existing.hiddenAt != null) {
      throw new NotFoundException('You have no review for this product');
    }

    return toMyReviewResponse(existing);
  }
}
