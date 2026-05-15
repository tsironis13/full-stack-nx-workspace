import { Test, TestingModule } from '@nestjs/testing';

import { RemoveCartItemUseCase } from './remove-cart-item.use-case';
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

describe('RemoveCartItemUseCase', () => {
  let useCase: RemoveCartItemUseCase;
  const removeItem = jest.fn();

  beforeEach(async () => {
    removeItem.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveCartItemUseCase,
        {
          provide: CartRepository,
          useValue: { removeItem },
        },
      ],
    }).compile();

    useCase = module.get(RemoveCartItemUseCase);
  });

  it('removes the item and returns the updated (empty) cart', async () => {
    removeItem.mockResolvedValue(buildCart());

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      cartItemId: 10,
    });

    expect(removeItem).toHaveBeenCalledWith({
      userId: 'user-uuid-123',
      cartItemId: 10,
    });
    expect(result.items).toHaveLength(0);
  });

  it('returns the remaining items after removal', async () => {
    const cartAfterRemoval = buildCart({
      items: [
        {
          id: 20,
          cartId: 1,
          productItemId: 55,
          quantity: 1,
          capturedPrice: 9.99,
          currentPrice: 9.99,
          capturedName: 'Other Item',
          capturedImageUrl: null,
          available: true,
        },
      ],
    });
    removeItem.mockResolvedValue(cartAfterRemoval);

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      cartItemId: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(20);
  });
});
