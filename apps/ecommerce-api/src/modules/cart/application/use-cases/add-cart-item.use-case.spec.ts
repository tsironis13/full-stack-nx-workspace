import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  AddCartItemUseCase,
  ProductItemSnapshotProvider,
} from './add-cart-item.use-case';
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

const SNAPSHOT = {
  id: 42,
  salePrice: 19.99,
  productName: 'Widget A',
  imageUrl: 'https://example.com/img.jpg',
};

describe('AddCartItemUseCase', () => {
  let useCase: AddCartItemUseCase;
  const addItem = jest.fn();
  const findById = jest.fn();

  beforeEach(async () => {
    addItem.mockReset();
    findById.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddCartItemUseCase,
        {
          provide: CartRepository,
          useValue: { addItem },
        },
        {
          provide: ProductItemSnapshotProvider,
          useValue: { findById },
        },
      ],
    }).compile();

    useCase = module.get(AddCartItemUseCase);
  });

  it('adds a new cart item and returns the updated cart', async () => {
    findById.mockResolvedValue(SNAPSHOT);
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
    addItem.mockResolvedValue(updatedCart);

    const result = await useCase.execute({
      userId: 'user-uuid-123',
      productItemId: 42,
      quantity: 2,
    });

    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-uuid-123',
        productItemId: 42,
        quantity: 2,
        capturedSalePrice: SNAPSHOT.salePrice,
        capturedName: SNAPSHOT.productName,
        capturedImageUrl: SNAPSHOT.imageUrl,
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].productItemId).toBe(42);
  });

  it('passes captured snapshot (latest price wins on duplicate merge)', async () => {
    findById.mockResolvedValue({ ...SNAPSHOT, salePrice: 25.0 });
    const updatedCart = buildCart({
      items: [
        {
          id: 10,
          cartId: 1,
          productItemId: 42,
          quantity: 5,
          capturedPrice: 25.0,
          currentPrice: 25.0,
          capturedName: 'Widget A',
          capturedImageUrl: null,
          available: true,
        },
      ],
    });
    addItem.mockResolvedValue(updatedCart);

    await useCase.execute({
      userId: 'user-uuid-123',
      productItemId: 42,
      quantity: 3,
    });

    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({ capturedSalePrice: 25.0 }),
    );
  });

  it('throws NotFoundException when product item does not exist', async () => {
    findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-uuid-123',
        productItemId: 999,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(addItem).not.toHaveBeenCalled();
  });
});
