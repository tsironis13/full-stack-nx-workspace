/**
 * Semantic Product retrieval for the Shopping Assistant. Embeds a shopper
 * need (Qwen3 Instruct/Query prefix) and returns compact Product
 * recommendation projections. Storefront catalog v1 still searches
 * `products.name` only.
 */
import { BadRequestException, Injectable } from '@nestjs/common';

import { EmbeddingClient } from '../../domain/embedding-client';
import type { ProductRecommendationProjection } from '../../domain/product-embedding.types';
import { ProductRecommendationProjectionBuilder } from '../../domain/product-recommendation-projection.builder';
import { formatEcommerceSearchQuery } from '../../domain/qwen3-embedding.instructions';
import { ProductEmbeddingSourceRepository } from '../../domain/repositories/product-embedding-source.repository';
import { ProductEmbeddingsRepository } from '../../domain/repositories/product-embeddings.repository';

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

@Injectable()
export class SearchProductEmbeddingsUseCase {
  private readonly projections = new ProductRecommendationProjectionBuilder();

  constructor(
    private readonly embeddingsRepository: ProductEmbeddingsRepository,
    private readonly sourceRepository: ProductEmbeddingSourceRepository,
    private readonly embeddingClient: EmbeddingClient,
  ) {}

  async execute(params: {
    query: string;
    limit?: number;
  }): Promise<ProductRecommendationProjection[]> {
    const query = params.query.trim();
    if (!query) {
      throw new BadRequestException('Search query must not be empty');
    }

    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, params.limit ?? DEFAULT_LIMIT),
    );
    const [embedding] = await this.embeddingClient.embed([
      formatEcommerceSearchQuery(query),
    ]);

    const hits = await this.embeddingsRepository.searchByEmbedding({
      embedding,
      limit,
    });
    const sources = await this.sourceRepository.loadByProductIds(
      hits.map((hit) => Number(hit.productId)),
    );
    const sourceById = new Map(
      sources.map((source) => [Number(source.productId), source]),
    );

    return hits.flatMap((hit) => {
      const source = sourceById.get(Number(hit.productId));
      if (!source) {
        return [];
      }
      return [this.projections.build(source, hit.similarity)];
    });
  }
}
