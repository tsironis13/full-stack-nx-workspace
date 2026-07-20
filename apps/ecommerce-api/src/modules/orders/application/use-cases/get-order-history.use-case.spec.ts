import { Test, TestingModule } from '@nestjs/testing';

import { GetOrderHistoryUseCase } from './get-order-history.use-case';
import { OrderHistoryRepository } from '../../domain/repositories/order-history.repository';
import type { OrderHistoryOrderRecord } from '../../domain/order-history.types';

const USER_ID = 'user-uuid-123';

function buildOrder(
  overrides: Partial<OrderHistoryOrderRecord> = {},
): OrderHistoryOrderRecord {
  return {
    id: 100,
    status: 'confirmed',
    totalAmount: 49.9,
    createdAt: new Date('2026-05-13T10:00:00.000Z'),
    items: [
      {
        productItemId: 10,
        productId: 5,
        productName: 'Widget A',
        productCode: 'SKU-A',
        salePrice: 20,
        quantity: 1,
        visibleReviewId: null,
      },
    ],
    ...overrides,
  };
}

describe('GetOrderHistoryUseCase', () => {
  let useCase: GetOrderHistoryUseCase;
  const findConfirmedOrdersWithReviewStatus = jest.fn();

  beforeEach(async () => {
    findConfirmedOrdersWithReviewStatus.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderHistoryUseCase,
        {
          provide: OrderHistoryRepository,
          useValue: { findConfirmedOrdersWithReviewStatus },
        },
      ],
    }).compile();

    useCase = module.get(GetOrderHistoryUseCase);
  });

  it('queries confirmed orders for the authenticated user', async () => {
    findConfirmedOrdersWithReviewStatus.mockResolvedValue([]);

    await useCase.execute({ userId: USER_ID });

    expect(findConfirmedOrdersWithReviewStatus).toHaveBeenCalledWith({
      userId: USER_ID,
    });
  });

  it('returns the response shape with productId, productName and createdAt ISO string', async () => {
    findConfirmedOrdersWithReviewStatus.mockResolvedValue([buildOrder()]);

    const result = await useCase.execute({ userId: USER_ID });

    expect(result).toEqual({
      orders: [
        {
          orderId: 100,
          status: 'confirmed',
          totalAmount: 49.9,
          createdAt: '2026-05-13T10:00:00.000Z',
          items: [
            {
              productItemId: 10,
              productId: 5,
              productName: 'Widget A',
              productCode: 'SKU-A',
              salePrice: 20,
              quantity: 1,
              canReview: true,
              hasReview: false,
              reviewId: null,
            },
          ],
        },
      ],
    });
  });

  it('marks a line with an existing visible review as hasReview with reviewId', async () => {
    findConfirmedOrdersWithReviewStatus.mockResolvedValue([
      buildOrder({
        items: [
          {
            productItemId: 11,
            productId: 6,
            productName: 'Widget B',
            productCode: 'SKU-B',
            salePrice: 15,
            quantity: 2,
            visibleReviewId: 77,
          },
        ],
      }),
    ]);

    const result = await useCase.execute({ userId: USER_ID });

    expect(result.orders[0].items[0]).toEqual(
      expect.objectContaining({
        canReview: true,
        hasReview: true,
        reviewId: 77,
      }),
    );
  });

  it('returns an empty list when the user has no confirmed orders', async () => {
    findConfirmedOrdersWithReviewStatus.mockResolvedValue([]);

    const result = await useCase.execute({ userId: USER_ID });

    expect(result).toEqual({ orders: [] });
  });
});
