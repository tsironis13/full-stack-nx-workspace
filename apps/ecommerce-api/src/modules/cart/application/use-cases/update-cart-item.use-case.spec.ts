import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UpdateCartItemUseCase } from './update-cart-item.use-case';
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

describe('UpdateCartItemUseCase', () => {
  let useCase: UpdateCartItemUseCase;
  const updateItemQuantity = jest.fn();

  beforeEach(async () => {
    updateItemQuantity.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCartItemUseCase,
        {
          provide: CartRepository,
          useValue: { updateItemQuantity },
        },
      ],
    }).compile();

    useCase = module.get(UpdateCartItemUseCase);
  });

  it('updates quantity and returns the updated cart', async () => {
    const updatedCart = buildCart({
      items: [
        {
          id: 10,
          cartId: 1,
          productItemId: 42,
          quantity: 5,
          capturedPrice: 19.99,
          currentPrice: 19.99,
          capturedName: 'Widget A',
          capturedImageUrl: null,
          available: true,
        },
      ],
    });
    updateItemQuantity.mockResolvedValue(updatedCart);

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      cartItemId: 10,
      quantity: 5,
    });

    expect(updateItemQuantity).toHaveBeenCalledWith({
      userId: 'user-uuid-123',
      cartItemId: 10,
      quantity: 5,
    });
    expect(result.items[0].quantity).toBe(5);
  });

  it('throws BadRequestException when quantity is 0', async () => {
    await expect(
      useCase.execute({
        userId: 'user-uuid-123',
        cartItemId: 10,
        quantity: 0,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(updateItemQuantity).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when quantity is negative', async () => {
    await expect(
      useCase.execute({
        userId: 'user-uuid-123',
        cartItemId: 10,
        quantity: -3,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(updateItemQuantity).not.toHaveBeenCalled();
  });

  it('accepts quantity of exactly 1', async () => {
    updateItemQuantity.mockResolvedValue(buildCart());

    await expect(
      useCase.execute({
        userId: 'user-uuid-123',
        cartItemId: 10,
        quantity: 1,
      }),
    ).resolves.toBeDefined();

    expect(updateItemQuantity).toHaveBeenCalled();
  });
});
