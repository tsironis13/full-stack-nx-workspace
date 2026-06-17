import { Module } from '@nestjs/common';

import { ReviewsController } from './presentation/controllers/reviews.controller';
import { ListProductReviewsUseCase } from './application/use-cases/list-product-reviews.use-case';
import { ReviewsRepository } from './domain/repositories/reviews.repository';
import { DrizzleReviewsRepository } from './infrastructure/drizzle-reviews.repository';

@Module({
  controllers: [ReviewsController],
  providers: [
    ListProductReviewsUseCase,
    {
      provide: ReviewsRepository,
      useClass: DrizzleReviewsRepository,
    },
  ],
})
export class ReviewsModule {}
