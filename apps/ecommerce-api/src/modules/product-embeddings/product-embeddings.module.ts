/**
 * Nest module for Product semantic search: index + query use cases wired to
 * Drizzle and the LM Studio embedding client. HTTP is Shopping Assistant
 * retrieval only — not storefront catalog `q`.
 */
import { Module } from '@nestjs/common';

import { IndexProductEmbeddingsUseCase } from './application/use-cases/index-product-embeddings.use-case';
import { SearchProductEmbeddingsUseCase } from './application/use-cases/search-product-embeddings.use-case';
import { EmbeddingClient } from './domain/embedding-client';
import { ProductEmbeddingSourceRepository } from './domain/repositories/product-embedding-source.repository';
import { ProductEmbeddingsRepository } from './domain/repositories/product-embeddings.repository';
import { DrizzleProductEmbeddingSourceRepository } from './infrastructure/drizzle-product-embedding-source.repository';
import { DrizzleProductEmbeddingsRepository } from './infrastructure/drizzle-product-embeddings.repository';
import { LmStudioEmbeddingClient } from './infrastructure/lm-studio-embedding.client';
import { ProductEmbeddingsSearchController } from './presentation/controllers/product-embeddings-search.controller';

@Module({
  controllers: [ProductEmbeddingsSearchController],
  providers: [
    IndexProductEmbeddingsUseCase,
    SearchProductEmbeddingsUseCase,
    {
      provide: ProductEmbeddingSourceRepository,
      useClass: DrizzleProductEmbeddingSourceRepository,
    },
    {
      provide: ProductEmbeddingsRepository,
      useClass: DrizzleProductEmbeddingsRepository,
    },
    {
      provide: EmbeddingClient,
      useClass: LmStudioEmbeddingClient,
    },
  ],
  exports: [IndexProductEmbeddingsUseCase, SearchProductEmbeddingsUseCase],
})
export class ProductEmbeddingsModule {}
