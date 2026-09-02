/**
 * Semantic Product retrieval. Embeds a shopper query (Qwen3 Instruct/Query
 * prefix) and ranks `product_embeddings` by cosine similarity. Used by the CLI
 * (`search`); storefront catalog v1 still searches `products.name` only.
 */
import { BadRequestException, Injectable } from '@nestjs/common';

import { EmbeddingClient } from '../../domain/embedding-client';
import type { ProductEmbeddingSearchHit } from '../../domain/product-embedding.types';
import { formatEcommerceSearchQuery } from '../../domain/qwen3-embedding.instructions';
import { ProductEmbeddingsRepository } from '../../domain/repositories/product-embeddings.repository';

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

@Injectable()
export class SearchProductEmbeddingsUseCase {
  constructor(
    private readonly embeddingsRepository: ProductEmbeddingsRepository,
    private readonly embeddingClient: EmbeddingClient,
  ) {}

  async execute(params: {
    query: string;
    limit?: number;
  }): Promise<ProductEmbeddingSearchHit[]> {
    const query = params.query.trim();
    console.log('query', query);
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

    return this.embeddingsRepository.searchByEmbedding({ embedding, limit });
  }
}
