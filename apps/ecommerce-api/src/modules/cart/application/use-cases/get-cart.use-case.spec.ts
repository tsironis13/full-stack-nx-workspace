import { Test, TestingModule } from '@nestjs/testing';

import { GetCartUseCase } from './get-cart.use-case';
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

describe('GetCartUseCase', () => {
  let useCase: GetCartUseCase;
  const getCartByUserId = jest.fn();

  beforeEach(async () => {
    getCartByUserId.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCartUseCase,
        {
          provide: CartRepository,
          useValue: { getCartByUserId },
        },
      ],
    }).compile();

    useCase = module.get(GetCartUseCase);
  });

  it('returns an empty cart for a new user', async () => {
    getCartByUserId.mockResolvedValue(buildCart());

    const result = await useCase.execute('user-uuid-123');

    expect(result.id).toBe(1);
    expect(result.userId).toBe('user-uuid-123');
    expect(result.items).toHaveLength(0);
  });

  it('maps cart items to CartResponseDto shape', async () => {
    const cart = buildCart({
      items: [
        {
          id: 10,
          cartId: 1,
          productItemId: 42,
          quantity: 3,
          capturedPrice: 19.99,
          currentPrice: 18.0,
          capturedName: 'Widget A',
          capturedImageUrl: 'https://example.com/img.jpg',
          available: true,
        },
      ],
    });
    getCartByUserId.mockResolvedValue(cart);

    const result = await useCase.execute('user-uuid-123');

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({
      id: 10,
      productItemId: 42,
      quantity: 3,
      capturedPrice: 19.99,
      currentPrice: 18.0,
      capturedName: 'Widget A',
      capturedImageUrl: 'https://example.com/img.jpg',
      available: true,
    });
  });

  it('marks item as unavailable when available is false', async () => {
    const cart = buildCart({
      items: [
        {
          id: 11,
          cartId: 1,
          productItemId: 99,
          quantity: 1,
          capturedPrice: 50.0,
          currentPrice: 50.0,
          capturedName: 'Archived Item',
          capturedImageUrl: null,
          available: false,
        },
      ],
    });
    getCartByUserId.mockResolvedValue(cart);

    const result = await useCase.execute('user-uuid-123');

    expect(result.items[0].available).toBe(false);
  });
});
