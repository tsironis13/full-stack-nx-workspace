/**
 * Offline catalog indexer. Loads Products, builds retrieval documents, embeds
 * them with the local Qwen3 model, and upserts 1024D vectors into
 * `product_embeddings`. Used by the CLI (`index`), not by storefront search.
 */
import { Injectable, Logger } from '@nestjs/common';

import { EmbeddingClient } from '../../domain/embedding-client';
import { ProductEmbeddingDocumentBuilder } from '../../domain/product-embedding-document.builder';
import { ProductEmbeddingSourceRepository } from '../../domain/repositories/product-embedding-source.repository';
import { ProductEmbeddingsRepository } from '../../domain/repositories/product-embeddings.repository';

const DEFAULT_BATCH_SIZE = 8;

export type IndexProductEmbeddingsResult = {
  productCount: number;
  skippedEmpty: number;
  model: string;
  dimensions: number;
};

@Injectable()
export class IndexProductEmbeddingsUseCase {
  private readonly logger = new Logger(IndexProductEmbeddingsUseCase.name);
  private readonly documents = new ProductEmbeddingDocumentBuilder();

  constructor(
    private readonly sourceRepository: ProductEmbeddingSourceRepository,
    private readonly embeddingsRepository: ProductEmbeddingsRepository,
    private readonly embeddingClient: EmbeddingClient,
  ) {}

  async execute(options?: {
    batchSize?: number;
    limit?: number;
  }): Promise<IndexProductEmbeddingsResult> {
    const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
    const sources = (await this.sourceRepository.loadAll()).slice(
      0,
      options?.limit,
    );

    const prepared: { productId: number; content: string }[] = [];
    let skippedEmpty = 0;

    for (const source of sources) {
      const content = this.documents.build(source).trim();
      if (!content) {
        skippedEmpty += 1;
        continue;
      }
      prepared.push({ productId: source.productId, content });
    }

    for (let i = 0; i < prepared.length; i += batchSize) {
      const batch = prepared.slice(i, i + batchSize);
      this.logger.log(
        `Embedding products ${i + 1}–${i + batch.length} of ${prepared.length}`,
      );
      const vectors = await this.embeddingClient.embed(
        batch.map((row) => row.content),
      );
      await this.embeddingsRepository.upsertMany(
        batch.map((row, index) => ({
          productId: row.productId,
          content: row.content,
          embedding: vectors[index],
          model: this.embeddingClient.model,
        })),
      );
    }

    return {
      productCount: prepared.length,
      skippedEmpty,
      model: this.embeddingClient.model,
      dimensions: this.embeddingClient.dimensions,
    };
  }
}
