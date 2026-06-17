import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import {
  computeAuthorDisplayName,
  isValidRating,
} from '../../domain/review.rules';
import type { AuthorProfile } from '../../domain/review.types';
import { MyReviewResponseDto } from '../dto/my-review-response.dto';
import { toMyReviewResponse } from '../review-response.mapper';

export interface EditReviewCommand {
  productId: number;
  userId: string;
  rating?: number;
  title?: string | null;
  body?: string | null;
  profile: AuthorProfile;
}

@Injectable()
export class EditReviewUseCase {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async execute(command: EditReviewCommand): Promise<MyReviewResponseDto> {
    const existing = await this.reviewsRepository.findByUserAndProduct({
      userId: command.userId,
      productId: command.productId,
    });

    if (!existing || existing.hiddenAt != null) {
      throw new NotFoundException('You have no review for this product');
    }

    const rating = command.rating ?? existing.rating;
    if (!isValidRating(rating)) {
      throw new BadRequestException('Rating must be a whole number from 1 to 5');
    }

    const title =
      command.title !== undefined ? command.title : existing.title;
    const body = command.body !== undefined ? command.body : existing.body;

    // Editing refreshes the author display-name snapshot from the profile.
    const authorDisplayName = computeAuthorDisplayName(command.profile);

    const updated = await this.reviewsRepository.updateReview({
      id: existing.id,
      rating,
      title,
      body,
      authorDisplayName,
      reactivate: false,
    });
    return toMyReviewResponse(updated);
  }
}
