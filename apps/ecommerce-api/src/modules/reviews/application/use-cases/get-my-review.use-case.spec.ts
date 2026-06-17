import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GetMyReviewUseCase } from './get-my-review.use-case';
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
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

describe('GetMyReviewUseCase', () => {
  let useCase: GetMyReviewUseCase;
  const findByUserAndProduct = jest.fn();

  beforeEach(async () => {
    findByUserAndProduct.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyReviewUseCase,
        {
          provide: ReviewsRepository,
          useValue: { findByUserAndProduct },
        },
      ],
    }).compile();

    useCase = module.get(GetMyReviewUseCase);
  });

  const query = { productId: PRODUCT_ID, userId: USER_ID };

  it('throws NotFoundException when there is no review', async () => {
    findByUserAndProduct.mockResolvedValue(null);

    await expect(useCase.execute(query)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException when the review is soft-deleted', async () => {
    findByUserAndProduct.mockResolvedValue(
      buildRecord({ hiddenAt: new Date() }),
    );

    await expect(useCase.execute(query)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns the current user review as a DTO', async () => {
    findByUserAndProduct.mockResolvedValue(buildRecord());

    const result = await useCase.execute(query);

    expect(result).toEqual({
      id: 99,
      productId: PRODUCT_ID,
      rating: 5,
      title: 'Great',
      body: 'Loved it',
      authorDisplayName: 'Kate R.',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });
});
