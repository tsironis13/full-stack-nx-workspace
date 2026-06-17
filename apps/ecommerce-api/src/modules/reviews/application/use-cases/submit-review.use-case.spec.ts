import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SubmitReviewUseCase } from './submit-review.use-case';
import { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import { VerifiedPurchaseRepository } from '../../domain/repositories/verified-purchase.repository';
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

describe('SubmitReviewUseCase', () => {
  let useCase: SubmitReviewUseCase;
  const productExists = jest.fn();
  const findByUserAndProduct = jest.fn();
  const createReview = jest.fn();
  const updateReview = jest.fn();
  const hasVerifiedPurchase = jest.fn();

  beforeEach(async () => {
    productExists.mockReset();
    findByUserAndProduct.mockReset();
    createReview.mockReset();
    updateReview.mockReset();
    hasVerifiedPurchase.mockReset();

    productExists.mockResolvedValue(true);
    hasVerifiedPurchase.mockResolvedValue(true);
    findByUserAndProduct.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitReviewUseCase,
        {
          provide: ReviewsRepository,
          useValue: {
            productExists,
            findByUserAndProduct,
            createReview,
            updateReview,
          },
        },
        {
          provide: VerifiedPurchaseRepository,
          useValue: { hasVerifiedPurchase },
        },
      ],
    }).compile();

    useCase = module.get(SubmitReviewUseCase);
  });

  function baseCommand(overrides = {}) {
    return {
      productId: PRODUCT_ID,
      userId: USER_ID,
      rating: 5,
      title: 'Great',
      body: 'Loved it',
      profile: { firstName: 'Kate', lastName: 'Robinson' },
      ...overrides,
    };
  }

  describe('rating validation', () => {
    it.each([0, 6, 3.5])(
      'throws BadRequestException for invalid rating %p',
      async (rating) => {
        await expect(
          useCase.execute(baseCommand({ rating })),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(hasVerifiedPurchase).not.toHaveBeenCalled();
        expect(createReview).not.toHaveBeenCalled();
      },
    );
  });

  describe('verified-purchase gate', () => {
    it('throws ForbiddenException (403) when the user has no verified purchase', async () => {
      hasVerifiedPurchase.mockResolvedValue(false);

      await expect(useCase.execute(baseCommand())).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(createReview).not.toHaveBeenCalled();
    });

    it('creates the review when the purchase is verified', async () => {
      createReview.mockResolvedValue(buildRecord());

      await useCase.execute(baseCommand());

      expect(createReview).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: PRODUCT_ID,
          userId: USER_ID,
          rating: 5,
          authorDisplayName: 'Kate R.',
        }),
      );
    });
  });

  describe('product existence', () => {
    it('throws NotFoundException when the product does not exist', async () => {
      productExists.mockResolvedValue(false);

      await expect(useCase.execute(baseCommand())).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('one review per user per product', () => {
    it('throws ConflictException (409) when an active review already exists', async () => {
      findByUserAndProduct.mockResolvedValue(buildRecord({ hiddenAt: null }));

      await expect(useCase.execute(baseCommand())).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(createReview).not.toHaveBeenCalled();
      expect(updateReview).not.toHaveBeenCalled();
    });
  });

  describe('resubmit reactivates a soft-deleted review', () => {
    it('reactivates the same row instead of creating a duplicate', async () => {
      findByUserAndProduct.mockResolvedValue(
        buildRecord({ id: 42, hiddenAt: new Date(), hiddenBy: 'author' }),
      );
      updateReview.mockResolvedValue(
        buildRecord({ id: 42, rating: 4, title: 'Rewritten', body: null }),
      );

      const result = await useCase.execute(
        baseCommand({ rating: 4, title: 'Rewritten', body: null }),
      );

      expect(createReview).not.toHaveBeenCalled();
      expect(updateReview).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42, rating: 4, reactivate: true }),
      );
      expect(result.rating).toBe(4);
    });
  });

  describe('author snapshot', () => {
    it('snapshots "Verified buyer" when the profile has no usable name', async () => {
      createReview.mockResolvedValue(buildRecord());

      await useCase.execute(baseCommand({ profile: {} }));

      expect(createReview).toHaveBeenCalledWith(
        expect.objectContaining({ authorDisplayName: 'Verified buyer' }),
      );
    });
  });
});
