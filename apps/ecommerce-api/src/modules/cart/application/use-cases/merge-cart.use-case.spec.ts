import { Test, TestingModule } from '@nestjs/testing';

import {
  MergeCartUseCase,
  ProductItemExistenceChecker,
} from './merge-cart.use-case';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { Cart } from '../../domain/cart.types';

function buildCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: 1,
    userId: 'user-uuid-123',
    items: [],
    ...overrides,
  };
}

describe('MergeCartUseCase', () => {
  let useCase: MergeCartUseCase;
  const mergeItems = jest.fn();
  const getCartByUserId = jest.fn();
  const isActive = jest.fn();

  beforeEach(async () => {
    mergeItems.mockReset();
    getCartByUserId.mockReset();
    isActive.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MergeCartUseCase,
        {
          provide: CartRepository,
          useValue: { mergeItems, getCartByUserId },
        },
        {
          provide: ProductItemExistenceChecker,
          useValue: { isActive },
        },
      ],
    }).compile();

    useCase = module.get(MergeCartUseCase);
  });

  it('inserts new cart items for valid guest lines', async () => {
    isActive.mockResolvedValue(true);
    const updatedCart = buildCart({
      items: [
        {
          id: 10,
          cartId: 1,
          productItemId: 42,
          quantity: 2,
          capturedPrice: 19.99,
          currentPrice: 19.99,
          capturedName: 'Widget A',
          capturedImageUrl: 'https://example.com/img.jpg',
          available: true,
        },
      ],
    });
    mergeItems.mockResolvedValue(updatedCart);

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      items: [
        {
          productItemId: 42,
          quantity: 2,
          capturedSalePrice: 19.99,
          capturedName: 'Widget A',
          capturedImageUrl: 'https://example.com/img.jpg',
        },
      ],
    });

    expect(isActive).toHaveBeenCalledWith(42);
    expect(mergeItems).toHaveBeenCalledWith({
      userId: 'user-uuid-123',
      items: [
        {
          productItemId: 42,
          quantity: 2,
          capturedSalePrice: 19.99,
          capturedName: 'Widget A',
          capturedImageUrl: 'https://example.com/img.jpg',
        },
      ],
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].productItemId).toBe(42);
  });

  it('combines quantities and refreshes snapshot for existing lines', async () => {
    isActive.mockResolvedValue(true);
    const updatedCart = buildCart({
      items: [
        {
          id: 10,
          cartId: 1,
          productItemId: 42,
          quantity: 5,
          capturedPrice: 25.0,
          currentPrice: 25.0,
          capturedName: 'Widget A v2',
          capturedImageUrl: null,
          available: true,
        },
      ],
    });
    mergeItems.mockResolvedValue(updatedCart);

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      items: [
        {
          productItemId: 42,
          quantity: 3,
          capturedSalePrice: 25.0,
          capturedName: 'Widget A v2',
          capturedImageUrl: null,
        },
      ],
    });

    expect(mergeItems).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            productItemId: 42,
            quantity: 3,
            capturedSalePrice: 25.0,
          }),
        ],
      }),
    );
    expect(result.items[0].quantity).toBe(5);
    expect(result.items[0].capturedName).toBe('Widget A v2');
  });

  it('silently drops lines whose product_item_id is archived or deleted', async () => {
    isActive.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const updatedCart = buildCart({
      items: [
        {
          id: 20,
          cartId: 1,
          productItemId: 99,
          quantity: 1,
          capturedPrice: 10.0,
          currentPrice: 10.0,
          capturedName: 'Valid Item',
          capturedImageUrl: null,
          available: true,
        },
      ],
    });
    mergeItems.mockResolvedValue(updatedCart);

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      items: [
        {
          productItemId: 1,
          quantity: 2,
          capturedSalePrice: 5.0,
          capturedName: 'Archived Item',
          capturedImageUrl: null,
        },
        {
          productItemId: 99,
          quantity: 1,
          capturedSalePrice: 10.0,
          capturedName: 'Valid Item',
          capturedImageUrl: null,
        },
      ],
    });

    expect(mergeItems).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({ productItemId: 99 }),
        ],
      }),
    );
    expect(result.items).toHaveLength(1);
  });

  it('is a no-op and returns the current cart when items array is empty', async () => {
    const currentCart = buildCart({
      items: [
        {
          id: 5,
          cartId: 1,
          productItemId: 77,
          quantity: 1,
          capturedPrice: 9.99,
          currentPrice: 9.99,
          capturedName: 'Existing Item',
          capturedImageUrl: null,
          available: true,
        },
      ],
    });
    getCartByUserId.mockResolvedValue(currentCart);

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      items: [],
    });

    expect(isActive).not.toHaveBeenCalled();
    expect(mergeItems).not.toHaveBeenCalled();
    expect(getCartByUserId).toHaveBeenCalledWith('user-uuid-123');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].productItemId).toBe(77);
  });
});
