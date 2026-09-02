import { Test, TestingModule } from '@nestjs/testing';

import { SearchProductEmbeddingsUseCase } from './search-product-embeddings.use-case';
import { EmbeddingClient } from '../../domain/embedding-client';
import { ProductEmbeddingSourceRepository } from '../../domain/repositories/product-embedding-source.repository';
import { ProductEmbeddingsRepository } from '../../domain/repositories/product-embeddings.repository';

describe('SearchProductEmbeddingsUseCase', () => {
  let useCase: SearchProductEmbeddingsUseCase;
  const searchByEmbedding = jest.fn();
  const loadByProductIds = jest.fn();
  const embed = jest.fn();

  beforeEach(async () => {
    searchByEmbedding.mockReset();
    loadByProductIds.mockReset();
    embed.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchProductEmbeddingsUseCase,
        {
          provide: ProductEmbeddingsRepository,
          useValue: { searchByEmbedding },
        },
        {
          provide: ProductEmbeddingSourceRepository,
          useValue: { loadByProductIds, loadAll: jest.fn() },
        },
        {
          provide: EmbeddingClient,
          useValue: { embed },
        },
      ],
    }).compile();

    useCase = module.get(SearchProductEmbeddingsUseCase);
  });

  it('embeds the need, ranks Products, and returns compact projections in rank order', async () => {
    embed.mockResolvedValue([[0.3, 0.4]]);
    searchByEmbedding.mockResolvedValue([
      { productId: 2, name: 'Shoe B', similarity: 0.9 },
      { productId: 1, name: 'Shoe A', similarity: 0.8 },
    ]);
    loadByProductIds.mockResolvedValue([
      {
        productId: 1,
        name: 'Shoe A',
        description: 'Light trainer',
        about: null,
        careInstructions: 'Wipe clean',
        categoryPath: ['Footwear'],
        attributes: [],
        salePrice: 80,
      },
      {
        productId: 2,
        name: 'Shoe B',
        description: 'Waterproof hiking shoe',
        about: null,
        careInstructions: null,
        categoryPath: ['Footwear', 'Hiking'],
        attributes: [{ name: 'Waterproof', value: 'Yes' }],
        salePrice: 140,
      },
    ]);

    const items = await useCase.execute({
      query: 'waterproof shoes for hiking',
    });

    expect(embed).toHaveBeenCalledWith([
      expect.stringContaining('Query:waterproof shoes for hiking'),
    ]);
    expect(searchByEmbedding).toHaveBeenCalledWith({
      embedding: [0.3, 0.4],
      limit: 8,
    });
    expect(loadByProductIds).toHaveBeenCalledWith([2, 1]);
    expect(items.map((item) => item.productId)).toEqual([2, 1]);
    expect(items[0]).toMatchObject({
      name: 'Shoe B',
      storefrontPath: '/products/2',
      options: 'Waterproof: Yes',
      excerpt: 'Waterproof hiking shoe',
    });
    expect(JSON.stringify(items)).not.toContain('Wipe clean');
  });

  it('still projects when ranking ids arrive as strings', async () => {
    embed.mockResolvedValue([[0.1]]);
    searchByEmbedding.mockResolvedValue([
      { productId: '9' as unknown as number, name: 'Boot', similarity: 0.7 },
    ]);
    loadByProductIds.mockResolvedValue([
      {
        productId: 9,
        name: 'Boot',
        description: 'Waterproof boot',
        about: null,
        careInstructions: null,
        categoryPath: ['Footwear'],
        attributes: [],
        salePrice: 90,
      },
    ]);

    const items = await useCase.execute({ query: 'waterproof boots' });

    expect(loadByProductIds).toHaveBeenCalledWith([9]);
    expect(items).toEqual([
      expect.objectContaining({
        productId: 9,
        storefrontPath: '/products/9',
        excerpt: 'Waterproof boot',
      }),
    ]);
  });

  it('still projects when source product ids arrive as strings', async () => {
    embed.mockResolvedValue([[0.1]]);
    searchByEmbedding.mockResolvedValue([
      { productId: 9, name: 'Boot', similarity: 0.7 },
    ]);
    loadByProductIds.mockResolvedValue([
      {
        productId: '9' as unknown as number,
        name: 'Boot',
        description: 'Waterproof boot',
        about: null,
        careInstructions: null,
        categoryPath: ['Footwear'],
        attributes: [],
        salePrice: 90,
      },
    ]);

    const items = await useCase.execute({ query: 'waterproof boots' });

    expect(items).toEqual([
      expect.objectContaining({
        productId: 9,
        storefrontPath: '/products/9',
      }),
    ]);
  });
});
