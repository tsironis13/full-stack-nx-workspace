import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SoftDeleteReviewUseCase } from './soft-delete-review.use-case';
import { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import type { ReviewRecord } from '../../domain/review.types';

const PRODUCT_ID = 7;
const USER_ID = 'user-uuid-123';

function buildRecord(overrides: Partial<ReviewRecord> = {}): ReviewRecord {
  return {
    id: 99,
    productId: PRODUCT_ID,
    userId: USER_ID,
    rating: 5,
    title: 'Great',
    body: 'Loved it',
    authorDisplayName: 'Kate R.',
    hiddenAt: null,
    hiddenBy: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('SoftDeleteReviewUseCase', () => {
  let useCase: SoftDeleteReviewUseCase;
  const findByUserAndProduct = jest.fn();
  const hideReview = jest.fn();

  beforeEach(async () => {
    findByUserAndProduct.mockReset();
    hideReview.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftDeleteReviewUseCase,
        {
          provide: ReviewsRepository,
          useValue: { findByUserAndProduct, hideReview },
        },
      ],
    }).compile();

    useCase = module.get(SoftDeleteReviewUseCase);
  });

  const command = { productId: PRODUCT_ID, userId: USER_ID };

  it('throws NotFoundException when there is no active review', async () => {
    findByUserAndProduct.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(hideReview).not.toHaveBeenCalled();
  });

  it('soft-hides the review as the author', async () => {
    findByUserAndProduct.mockResolvedValue(buildRecord({ id: 42 }));
    hideReview.mockResolvedValue(buildRecord({ id: 42, hiddenAt: new Date() }));

    await useCase.execute(command);

    expect(hideReview).toHaveBeenCalledWith({ id: 42, hiddenBy: 'author' });
  });
});
