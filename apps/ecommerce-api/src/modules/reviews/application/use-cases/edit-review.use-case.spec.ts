import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EditReviewUseCase } from './edit-review.use-case';
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

describe('EditReviewUseCase', () => {
  let useCase: EditReviewUseCase;
  const findByUserAndProduct = jest.fn();
  const updateReview = jest.fn();

  beforeEach(async () => {
    findByUserAndProduct.mockReset();
    updateReview.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditReviewUseCase,
        {
          provide: ReviewsRepository,
          useValue: { findByUserAndProduct, updateReview },
        },
      ],
    }).compile();

    useCase = module.get(EditReviewUseCase);
  });

  const command = {
    productId: PRODUCT_ID,
    userId: USER_ID,
    rating: 3,
    profile: { firstName: 'Kate', lastName: 'Robinson' },
  };

  it('throws NotFoundException when the user has no review', async () => {
    findByUserAndProduct.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException when the only review is soft-deleted', async () => {
    findByUserAndProduct.mockResolvedValue(
      buildRecord({ hiddenAt: new Date(), hiddenBy: 'author' }),
    );

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects an out-of-range rating', async () => {
    findByUserAndProduct.mockResolvedValue(buildRecord());

    await expect(
      useCase.execute({ ...command, rating: 9 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(updateReview).not.toHaveBeenCalled();
  });

  it('edits stars and refreshes the author display-name snapshot', async () => {
    findByUserAndProduct.mockResolvedValue(buildRecord());
    updateReview.mockResolvedValue(buildRecord({ rating: 3 }));

    await useCase.execute({
      ...command,
      rating: 3,
      profile: { firstName: 'Maria', lastName: 'Nikolaou' },
    });

    expect(updateReview).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 99,
        rating: 3,
        authorDisplayName: 'Maria N.',
        reactivate: false,
      }),
    );
  });

  it('keeps existing values when fields are omitted', async () => {
    findByUserAndProduct.mockResolvedValue(buildRecord());
    updateReview.mockResolvedValue(buildRecord());

    await useCase.execute({
      productId: PRODUCT_ID,
      userId: USER_ID,
      profile: { firstName: 'Kate', lastName: 'Robinson' },
    });

    expect(updateReview).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 5, title: 'Great', body: 'Loved it' }),
    );
  });
});
