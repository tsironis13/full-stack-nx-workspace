import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import { VerifiedPurchaseRepository } from '../../domain/repositories/verified-purchase.repository';
import {
  computeAuthorDisplayName,
  isValidRating,
} from '../../domain/review.rules';
import type { AuthorProfile } from '../../domain/review.types';
import { MyReviewResponseDto } from '../dto/my-review-response.dto';
import { toMyReviewResponse } from '../review-response.mapper';

export interface SubmitReviewCommand {
  productId: number;
  userId: string;
  rating: number;
  title: string | null;
  body: string | null;
  profile: AuthorProfile;
}

@Injectable()
export class SubmitReviewUseCase {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly verifiedPurchaseRepository: VerifiedPurchaseRepository,
  ) {}

  async execute(command: SubmitReviewCommand): Promise<MyReviewResponseDto> {
    if (!isValidRating(command.rating)) {
      throw new BadRequestException('Rating must be a whole number from 1 to 5');
    }

    const productExists = await this.reviewsRepository.productExists(
      command.productId,
    );
    if (!productExists) {
      throw new NotFoundException(`Product ${command.productId} not found`);
    }

    const verified = await this.verifiedPurchaseRepository.hasVerifiedPurchase({
      userId: command.userId,
      productId: command.productId,
    });
    if (!verified) {
      throw new ForbiddenException(
        'A verified purchase is required to review this product',
      );
    }

    const authorDisplayName = computeAuthorDisplayName(command.profile);

    const existing = await this.reviewsRepository.findByUserAndProduct({
      userId: command.userId,
      productId: command.productId,
    });

    if (existing) {
      if (existing.hiddenAt == null) {
        throw new ConflictException(
          'You have already reviewed this product',
        );
      }

      // Soft-deleted then resubmitted: reactivate the same row.
      const reactivated = await this.reviewsRepository.updateReview({
        id: existing.id,
        rating: command.rating,
        title: command.title,
        body: command.body,
        authorDisplayName,
        reactivate: true,
      });
      return toMyReviewResponse(reactivated);
    }

    const created = await this.reviewsRepository.createReview({
      productId: command.productId,
      userId: command.userId,
      rating: command.rating,
      title: command.title,
      body: command.body,
      authorDisplayName,
    });
    return toMyReviewResponse(created);
  }
}
