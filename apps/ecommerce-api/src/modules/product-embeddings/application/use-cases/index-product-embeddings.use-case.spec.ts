import { Test, TestingModule } from '@nestjs/testing';

import { IndexProductEmbeddingsUseCase } from './index-product-embeddings.use-case';
import { EmbeddingClient } from '../../domain/embedding-client';
import { ProductEmbeddingSourceRepository } from '../../domain/repositories/product-embedding-source.repository';
import { ProductEmbeddingsRepository } from '../../domain/repositories/product-embeddings.repository';

describe('IndexProductEmbeddingsUseCase', () => {
  let useCase: IndexProductEmbeddingsUseCase;
  const loadAll = jest.fn();
  const upsertMany = jest.fn();
  const embed = jest.fn();

  beforeEach(async () => {
    loadAll.mockReset();
    upsertMany.mockReset();
    embed.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndexProductEmbeddingsUseCase,
        {
          provide: ProductEmbeddingSourceRepository,
          useValue: { loadAll },
        },
        {
          provide: ProductEmbeddingsRepository,
          useValue: { upsertMany },
        },
        {
          provide: EmbeddingClient,
          useValue: {
            model: 'text-embedding-qwen3-embedding-0.6b',
            dimensions: 1024,
            embed,
          },
        },
      ],
    }).compile();

    useCase = module.get(IndexProductEmbeddingsUseCase);
  });

  it('embeds Product documents in batches and upserts vectors', async () => {
    loadAll.mockResolvedValue([
      {
        productId: 1,
        name: 'Phone A',
        description: 'Excellent camera',
        about: null,
        careInstructions: null,
        categoryPath: ['Electronics', 'Smartphones'],
        attributes: [],
        salePrice: 799,
      },
      {
        productId: 2,
        name: 'Phone B',
        description: 'Long battery',
        about: null,
        careInstructions: null,
        categoryPath: ['Electronics', 'Smartphones'],
        attributes: [],
        salePrice: 499,
      },
    ]);
    embed.mockResolvedValue([[0.1], [0.2]]);
    upsertMany.mockResolvedValue(undefined);

    const result = await useCase.execute({ batchSize: 8 });

    expect(embed).toHaveBeenCalledTimes(1);
    const texts = embed.mock.calls[0][0] as string[];
    expect(texts[0]).toContain('Product: Phone A');
    expect(texts[0]).not.toMatch(/^Instruct:/);
    expect(upsertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        productId: 1,
        embedding: [0.1],
        model: 'text-embedding-qwen3-embedding-0.6b',
      }),
      expect.objectContaining({
        productId: 2,
        embedding: [0.2],
      }),
    ]);
    expect(result).toEqual({
      productCount: 2,
      skippedEmpty: 0,
      model: 'text-embedding-qwen3-embedding-0.6b',
      dimensions: 1024,
    });
  });
});
