import { Module } from '@nestjs/common';

import { SupabaseAuthModule } from '@full-stack-nx-workspace/auth';

import { ReviewsController } from './presentation/controllers/reviews.controller';
import { ListProductReviewsUseCase } from './application/use-cases/list-product-reviews.use-case';
import { SubmitReviewUseCase } from './application/use-cases/submit-review.use-case';
import { EditReviewUseCase } from './application/use-cases/edit-review.use-case';
import { SoftDeleteReviewUseCase } from './application/use-cases/soft-delete-review.use-case';
import { GetMyReviewUseCase } from './application/use-cases/get-my-review.use-case';
import { ReviewsRepository } from './domain/repositories/reviews.repository';
import { VerifiedPurchaseRepository } from './domain/repositories/verified-purchase.repository';
import { DrizzleReviewsRepository } from './infrastructure/drizzle-reviews.repository';
import { DrizzleVerifiedPurchaseRepository } from './infrastructure/drizzle-verified-purchase.repository';

@Module({
  imports: [SupabaseAuthModule],
  controllers: [ReviewsController],
  providers: [
    ListProductReviewsUseCase,
    SubmitReviewUseCase,
    EditReviewUseCase,
    SoftDeleteReviewUseCase,
    GetMyReviewUseCase,
    {
      provide: ReviewsRepository,
      useClass: DrizzleReviewsRepository,
    },
    {
      provide: VerifiedPurchaseRepository,
      useClass: DrizzleVerifiedPurchaseRepository,
    },
  ],
})
export class ReviewsModule {}
