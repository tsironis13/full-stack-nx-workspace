/**
 * CLI entry for Product embeddings: `index`, `preview`, `search "<query>"`.
 * Built via `webpack.cli.config.js`; run with
 * `nx run ecommerce-api:product-embeddings --args="..."`.
 */
import './load-env';
import 'reflect-metadata';
import { Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { DrizzleModule } from '../../../../drizzle/drizzle.module';
import { IndexProductEmbeddingsUseCase } from '../../application/use-cases/index-product-embeddings.use-case';
import { SearchProductEmbeddingsUseCase } from '../../application/use-cases/search-product-embeddings.use-case';
import { ProductEmbeddingDocumentBuilder } from '../../domain/product-embedding-document.builder';
import { ProductEmbeddingSourceRepository } from '../../domain/repositories/product-embedding-source.repository';
import { ProductEmbeddingsModule } from '../../product-embeddings.module';

@Module({
  imports: [DrizzleModule, ProductEmbeddingsModule],
})
class ProductEmbeddingsCliModule {}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const app = await NestFactory.createApplicationContext(
    ProductEmbeddingsCliModule
  );

  try {
    if (command === 'search') {
      const query = rest.join(' ').trim();
      const search = app.get(SearchProductEmbeddingsUseCase);
      const hits = await search.execute({ query });
      Logger.log(JSON.stringify(hits, null, 2));
      return;
    }

    if (command === 'preview') {
      const sourceRepository = app.get(ProductEmbeddingSourceRepository);
      const builder = new ProductEmbeddingDocumentBuilder();
      const sources = await sourceRepository.loadAll();
      const count = Number.parseInt(rest[0] ?? '3', 10);
      for (const source of sources.slice(0, Number.isFinite(count) ? count : 3)) {
        Logger.log(`--- product ${source.productId} ---`);
        Logger.log(builder.build(source));
      }
      Logger.log(`Total products: ${sources.length}`);
      return;
    }

    if (command && command !== 'index') {
      throw new Error(
        `Unknown command "${command}". Use index, preview, or search "<query>".`
      );
    }

    const limitArg = rest.find((arg) => arg.startsWith('--limit='));
    const limit = limitArg
      ? Number.parseInt(limitArg.slice('--limit='.length), 10)
      : undefined;

    const index = app.get(IndexProductEmbeddingsUseCase);
    const result = await index.execute({
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    Logger.log(
      `Indexed ${result.productCount} products with ${result.model} (${result.dimensions}D); skipped ${result.skippedEmpty} empty`
    );
  } finally {
    await app.close();
    process.exit();
  }
}

main().catch((error: unknown) => {
  Logger.error(error);
  process.exitCode = 1;
});
