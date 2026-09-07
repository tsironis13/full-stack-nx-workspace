import { Test, TestingModule } from '@nestjs/testing';

import { ConvertProductItemUseCase } from './convert-product-item.use-case';
import { ProductItemConversionRepository } from '../../domain/repositories/product-item-conversion.repository';
import type {
  ConversionProduct,
  ConversionProductItem,
} from '../../domain/product-item-conversion.types';

function item(
  overrides: Partial<ConversionProductItem> &
    Pick<ConversionProductItem, 'id' | 'inventory'>,
): ConversionProductItem {
  return {
    options: [],
    salePrice: 10,
    originalPrice: 12,
    imageUrl: null,
    ...overrides,
  };
}

describe('ConvertProductItemUseCase', () => {
  let useCase: ConvertProductItemUseCase;
  const findByProductId = jest.fn();

  beforeEach(async () => {
    findByProductId.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConvertProductItemUseCase,
        {
          provide: ProductItemConversionRepository,
          useValue: { findByProductId },
        },
      ],
    }).compile();

    useCase = module.get(ConvertProductItemUseCase);
  });

  it('returns matched for a Product with one In Stock Product Item', async () => {
    const product: ConversionProduct = {
      id: 7,
      name: 'Trail Bottle',
      items: [
        {
          id: 42,
          options: [{ name: 'Color', value: 'Blue' }],
          salePrice: 19.5,
          originalPrice: 24,
          inventory: 8,
          imageUrl: 'https://cdn.example/bottle.jpg',
        },
      ],
    };
    findByProductId.mockResolvedValue(product);

    const result = await useCase.execute({ productId: 7 });

    expect(findByProductId).toHaveBeenCalledWith(7);
    expect(result).toEqual({
      status: 'matched',
      productItem: {
        id: 42,
        options: [{ name: 'Color', value: 'Blue' }],
        salePrice: 19.5,
        originalPrice: 24,
        inventory: 8,
        name: 'Trail Bottle',
        imageUrl: 'https://cdn.example/bottle.jpg',
      },
    });
  });

  it('returns not_found when the Product is missing', async () => {
    findByProductId.mockResolvedValue(null);

    const result = await useCase.execute({ productId: 999 });

    expect(findByProductId).toHaveBeenCalledWith(999);
    expect(result).toEqual({ status: 'not_found' });
  });

  it('coerces string Product Item ids to numbers on matched', async () => {
    const product: ConversionProduct = {
      id: '7' as unknown as number,
      name: 'Trail Bottle',
      items: [
        {
          id: '42' as unknown as number,
          options: [{ name: 'Color', value: 'Blue' }],
          salePrice: 19.5,
          originalPrice: 24,
          inventory: 8,
          imageUrl: 'https://cdn.example/bottle.jpg',
        },
      ],
    };
    findByProductId.mockResolvedValue(product);

    const result = await useCase.execute({ productId: 7 });

    expect(result).toEqual({
      status: 'matched',
      productItem: expect.objectContaining({ id: 42 }),
    });
  });

  it('coerces string Product Item ids to numbers on needs_options', async () => {
    const product: ConversionProduct = {
      id: 7,
      name: 'ForgeBook Pro 16',
      items: [
        {
          id: '21017' as unknown as number,
          options: [],
          salePrice: 1709.05,
          originalPrice: 1799,
          inventory: 10,
          imageUrl: null,
        },
        {
          id: '21018' as unknown as number,
          options: [],
          salePrice: 1834.98,
          originalPrice: 1942.92,
          inventory: 10,
          imageUrl: null,
        },
      ],
    };
    findByProductId.mockResolvedValue(product);

    const result = await useCase.execute({ productId: 7 });

    expect(result).toEqual({
      status: 'needs_options',
      items: [
        expect.objectContaining({ id: 21017, disabled: false }),
        expect.objectContaining({ id: 21018, disabled: false }),
      ],
    });
  });

  describe('matching table (hints × items × stock)', () => {
    const red = item({
      id: 1,
      options: [{ name: 'Color', value: 'Red' }],
      inventory: 8,
    });
    const blue = item({
      id: 2,
      options: [{ name: 'Color', value: 'Blue' }],
      inventory: 5,
    });
    const blueOos = { ...blue, inventory: 0 };
    const redOos = { ...red, inventory: 0 };

    it('matches unique in-stock hints and skips pickers', async () => {
      findByProductId.mockResolvedValue({
        id: 7,
        name: 'Trail Bottle',
        items: [red, blue],
      });

      const result = await useCase.execute({
        productId: 7,
        hintText: 'blue',
      });

      expect(result).toEqual({
        status: 'matched',
        productItem: expect.objectContaining({
          id: 2,
          name: 'Trail Bottle',
          inventory: 5,
        }),
      });
    });

    it('opens pickers for no hints on a Product with more than one Product Item', async () => {
      findByProductId.mockResolvedValue({
        id: 7,
        name: 'Trail Bottle',
        items: [red, blueOos],
      });

      const result = await useCase.execute({ productId: 7 });

      expect(result).toEqual({
        status: 'needs_options',
        items: [
          expect.objectContaining({ id: 1, disabled: false }),
          expect.objectContaining({ id: 2, disabled: true }),
        ],
      });
    });

    it('opens pickers for ambiguous hints instead of guessing a Product Item', async () => {
      findByProductId.mockResolvedValue({
        id: 7,
        name: 'Trail Bottle',
        items: [
          item({
            id: 1,
            options: [
              { name: 'Color', value: 'Red' },
              { name: 'Size', value: '42' },
            ],
            inventory: 8,
          }),
          item({
            id: 2,
            options: [
              { name: 'Color', value: 'Red' },
              { name: 'Size', value: '43' },
            ],
            inventory: 4,
          }),
        ],
      });

      const result = await useCase.execute({
        productId: 7,
        hintText: 'red',
      });

      expect(result.status).toBe('needs_options');
      if (result.status === 'needs_options') {
        expect(result.items.map((row) => row.id)).toEqual([1, 2]);
        expect(result.items.every((row) => row.disabled === false)).toBe(true);
      }
    });

    it('skips the silent fast path for a unique out-of-stock match and flags that combination disabled', async () => {
      findByProductId.mockResolvedValue({
        id: 7,
        name: 'Trail Bottle',
        items: [red, blueOos],
      });

      const result = await useCase.execute({
        productId: 7,
        hintText: 'blue',
      });

      expect(result).toEqual({
        status: 'needs_options',
        items: [
          expect.objectContaining({ id: 1, disabled: false }),
          expect.objectContaining({ id: 2, disabled: true }),
        ],
      });
    });

    it('stops with all_out_of_stock when every Product Item is out of stock', async () => {
      findByProductId.mockResolvedValue({
        id: 7,
        name: 'Trail Bottle',
        items: [redOos, blueOos],
      });

      const result = await useCase.execute({
        productId: 7,
        hintText: 'blue',
      });

      expect(result).toEqual({ status: 'all_out_of_stock' });
    });

    it('returns not_found when the Product is missing', async () => {
      findByProductId.mockResolvedValue(null);

      const result = await useCase.execute({ productId: 999 });

      expect(result).toEqual({ status: 'not_found' });
    });
  });
});
