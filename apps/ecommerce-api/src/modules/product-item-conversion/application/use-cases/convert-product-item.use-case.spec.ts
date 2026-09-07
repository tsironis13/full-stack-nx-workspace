import { Test, TestingModule } from '@nestjs/testing';

import { ConvertProductItemUseCase } from './convert-product-item.use-case';
import { ProductItemConversionRepository } from '../../domain/repositories/product-item-conversion.repository';
import type { ConversionProduct } from '../../domain/product-item-conversion.types';

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
        expect.objectContaining({ id: 21017 }),
        expect.objectContaining({ id: 21018 }),
      ],
    });
  });
});
