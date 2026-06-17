import { Injectable, NotFoundException } from '@nestjs/common';

import { ReviewsRepository } from '../../domain/repositories/reviews.repository';

export interface SoftDeleteReviewCommand {
  productId: number;
  userId: string;
}

@Injectable()
export class SoftDeleteReviewUseCase {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async execute(command: SoftDeleteReviewCommand): Promise<void> {
    const existing = await this.reviewsRepository.findByUserAndProduct({
      userId: command.userId,
      productId: command.productId,
    });

    if (!existing || existing.hiddenAt != null) {
      throw new NotFoundException('You have no review for this product');
    }

    await this.reviewsRepository.hideReview({
      id: existing.id,
      hiddenBy: 'author',
    });
  }
}
