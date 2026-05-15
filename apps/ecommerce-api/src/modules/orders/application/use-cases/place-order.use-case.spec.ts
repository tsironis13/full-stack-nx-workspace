import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PlaceOrderUseCase, PlaceOrderCommand } from './place-order.use-case';
import { OrdersRepository } from '../../domain/repositories/orders.repository';
import { ProductItemsRepository } from '../../domain/repositories/product-items.repository';

const BASE_SHIPPING = {
  fullName: 'John Doe',
  streetAddress: '123 Main St',
  city: 'Athens',
  postalCode: '10001',
  country: 'GR',
  phone: '+30 210 0000000',
};

const PRODUCT_ITEM_1 = {
  id: 10,
  sku: 'SKU-A',
  salePrice: 20.0,
  originalPrice: 30.0,
  productName: 'Widget A',
};

const PRODUCT_ITEM_2 = {
  id: 11,
  sku: 'SKU-B',
  salePrice: 15.5,
  originalPrice: 25.0,
  productName: 'Widget B',
};

function makeOrder(overrides: Partial<ReturnType<typeof buildOrder>> = {}) {
  return buildOrder(overrides);
}

function buildOrder(overrides: Record<string, unknown> = {}): {
  id: number;
  userId: string | null;
  guestEmail: string;
  status: string;
  shippingAddress: typeof BASE_SHIPPING;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  items: {
    productItemId: number;
    productName: string;
    productCode: string;
    salePrice: number;
    originalPrice: number;
    quantity: number;
  }[];
} {
  return {
    id: 100,
    userId: null,
    guestEmail: 'guest@example.com',
    status: 'confirmed',
    shippingAddress: BASE_SHIPPING,
    paymentStatus: 'pending',
    totalAmount: 20.0,
    createdAt: new Date('2026-05-13T10:00:00.000Z'),
    items: [],
    ...overrides,
  };
}

describe('PlaceOrderUseCase', () => {
  let useCase: PlaceOrderUseCase;
  const findByIds = jest.fn();
  const createOrder = jest.fn();

  beforeEach(async () => {
    findByIds.mockReset();
    createOrder.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceOrderUseCase,
        {
          provide: OrdersRepository,
          useValue: { createOrder },
        },
        {
          provide: ProductItemsRepository,
          useValue: { findByIds },
        },
      ],
    }).compile();

    useCase = module.get(PlaceOrderUseCase);
  });

  describe('price recalculation (ADR-0004)', () => {
    it('uses DB prices, not client-submitted values', async () => {
      findByIds.mockResolvedValue([PRODUCT_ITEM_1]);
      createOrder.mockResolvedValue(makeOrder({ totalAmount: 20.0 }));

      const command: PlaceOrderCommand = {
        userId: null,
        guestEmail: 'guest@example.com',
        shippingAddress: BASE_SHIPPING,
        items: [{ productItemId: 10, quantity: 1 }],
      };

      await useCase.execute(command);

      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              salePrice: PRODUCT_ITEM_1.salePrice,
              originalPrice: PRODUCT_ITEM_1.originalPrice,
            }),
          ]),
        }),
      );
    });
  });

  describe('totalAmount correctness', () => {
    it('computes totalAmount as sum of salePrice × quantity for a single item', async () => {
      findByIds.mockResolvedValue([PRODUCT_ITEM_1]);
      createOrder.mockResolvedValue(makeOrder({ totalAmount: 40.0 }));

      await useCase.execute({
        userId: null,
        guestEmail: 'guest@example.com',
        shippingAddress: BASE_SHIPPING,
        items: [{ productItemId: 10, quantity: 2 }],
      });

      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ totalAmount: 40.0 }),
      );
    });

    it('computes totalAmount correctly across multiple distinct items', async () => {
      findByIds.mockResolvedValue([PRODUCT_ITEM_1, PRODUCT_ITEM_2]);
      const expectedTotal =
        PRODUCT_ITEM_1.salePrice * 2 + PRODUCT_ITEM_2.salePrice * 3;
      createOrder.mockResolvedValue(makeOrder({ totalAmount: expectedTotal }));

      await useCase.execute({
        userId: null,
        guestEmail: 'guest@example.com',
        shippingAddress: BASE_SHIPPING,
        items: [
          { productItemId: 10, quantity: 2 },
          { productItemId: 11, quantity: 3 },
        ],
      });

      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ totalAmount: expectedTotal }),
      );
    });
  });

  describe('userId / guestEmail mutual-exclusivity (ADR-0003)', () => {
    it('throws BadRequestException when neither userId nor guestEmail is set', async () => {
      await expect(
        useCase.execute({
          userId: null,
          guestEmail: null,
          shippingAddress: BASE_SHIPPING,
          items: [{ productItemId: 10, quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(findByIds).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when both userId and guestEmail are set', async () => {
      await expect(
        useCase.execute({
          userId: 'user-uuid-123',
          guestEmail: 'guest@example.com',
          shippingAddress: BASE_SHIPPING,
          items: [{ productItemId: 10, quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(findByIds).not.toHaveBeenCalled();
    });

    it('accepts a guest order (userId null, guestEmail set)', async () => {
      findByIds.mockResolvedValue([PRODUCT_ITEM_1]);
      createOrder.mockResolvedValue(
        makeOrder({ userId: null, guestEmail: 'guest@example.com' }),
      );

      const result = await useCase.execute({
        userId: null,
        guestEmail: 'guest@example.com',
        shippingAddress: BASE_SHIPPING,
        items: [{ productItemId: 10, quantity: 1 }],
      });

      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          guestEmail: 'guest@example.com',
        }),
      );
      expect(result.status).toBe('confirmed');
    });

    it('accepts an authenticated order (userId set, guestEmail null)', async () => {
      findByIds.mockResolvedValue([PRODUCT_ITEM_1]);
      createOrder.mockResolvedValue(
        makeOrder({ userId: 'user-uuid-123', guestEmail: undefined }),
      );

      const result = await useCase.execute({
        userId: 'user-uuid-123',
        guestEmail: null,
        shippingAddress: BASE_SHIPPING,
        items: [{ productItemId: 10, quantity: 1 }],
      });

      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-uuid-123', guestEmail: null }),
      );
      expect(result.orderId).toBe(100);
    });
  });

  describe('product item validation', () => {
    it('throws NotFoundException when a productItemId does not exist in DB', async () => {
      findByIds.mockResolvedValue([]);

      await expect(
        useCase.execute({
          userId: null,
          guestEmail: 'guest@example.com',
          shippingAddress: BASE_SHIPPING,
          items: [{ productItemId: 999, quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(createOrder).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if only some items are missing', async () => {
      findByIds.mockResolvedValue([PRODUCT_ITEM_1]);

      await expect(
        useCase.execute({
          userId: null,
          guestEmail: 'guest@example.com',
          shippingAddress: BASE_SHIPPING,
          items: [
            { productItemId: 10, quantity: 1 },
            { productItemId: 999, quantity: 1 },
          ],
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(createOrder).not.toHaveBeenCalled();
    });
  });

  describe('response shape', () => {
    it('returns orderId, status confirmed, totalAmount and createdAt ISO string', async () => {
      findByIds.mockResolvedValue([PRODUCT_ITEM_1]);
      const createdAt = new Date('2026-05-13T10:00:00.000Z');
      createOrder.mockResolvedValue(
        makeOrder({ id: 42, totalAmount: 20.0, createdAt }),
      );

      const result = await useCase.execute({
        userId: null,
        guestEmail: 'guest@example.com',
        shippingAddress: BASE_SHIPPING,
        items: [{ productItemId: 10, quantity: 1 }],
      });

      expect(result).toEqual({
        orderId: 42,
        status: 'confirmed',
        totalAmount: 20.0,
        createdAt: '2026-05-13T10:00:00.000Z',
      });
    });
  });
});
