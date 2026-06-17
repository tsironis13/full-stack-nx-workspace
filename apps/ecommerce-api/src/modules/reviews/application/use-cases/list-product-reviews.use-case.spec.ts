import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ListProductReviewsUseCase } from './list-product-reviews.use-case';
import { ReviewsRepository } from '../../domain/repositories/reviews.repository';

describe('ListProductReviewsUseCase', () => {
  let useCase: ListProductReviewsUseCase;
  const productExists = jest.fn();
  const findVisibleReviewsPage = jest.fn();

  beforeEach(async () => {
    productExists.mockReset();
    findVisibleReviewsPage.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProductReviewsUseCase,
        {
          provide: ReviewsRepository,
          useValue: {
            productExists,
            findVisibleReviewsPage,
          },
        },
      ],
    }).compile();

    useCase = module.get(ListProductReviewsUseCase);
  });

  it('returns paginated visible reviews with exact aggregate summary', async () => {
    productExists.mockResolvedValue(true);
    findVisibleReviewsPage.mockResolvedValue({
      items: [
        {
          id: 1,
          rating: 5,
          title: 'Great',
          body: 'Loved it',
          authorDisplayName: 'Kate R.',
          createdAt: new Date('2026-01-15T10:00:00.000Z'),
        },
        {
          id: 2,
          rating: 4,
          title: null,
          body: null,
          authorDisplayName: 'Verified buyer',
          createdAt: new Date('2026-01-10T10:00:00.000Z'),
        },
      ],
      total: 2,
      summary: {
        averageRating: 4.5,
        reviewCount: 2,
      },
    });

    const result = await useCase.execute({
      productId: 10,
      page: 1,
      pageSize: 10,
    });

    expect(findVisibleReviewsPage).toHaveBeenCalledWith({
      productId: 10,
      page: 1,
      pageSize: 10,
    });
    expect(result.averageRating).toBe(4.5);
    expect(result.reviewCount).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[1].body).toBeNull();
  });

  it('excludes hidden reviews via repository-visible query contract', async () => {
    productExists.mockResolvedValue(true);
    findVisibleReviewsPage.mockResolvedValue({
      items: [],
      total: 0,
      summary: {
        averageRating: null,
        reviewCount: 0,
      },
    });

    const result = await useCase.execute({
      productId: 10,
      page: 1,
      pageSize: 10,
    });

    expect(result.averageRating).toBeNull();
    expect(result.reviewCount).toBe(0);
    expect(result.items).toEqual([]);
  });

  it('throws when the product does not exist', async () => {
    productExists.mockResolvedValue(false);

    await expect(
      useCase.execute({ productId: 999, page: 1, pageSize: 10 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
