/**
 * Shopping Assistant retrieval. Not storefront catalog search (`GET /products/catalog`).
 */
import { Controller, Get, Query } from '@nestjs/common';

import { SearchProductEmbeddingsUseCase } from '../../application/use-cases/search-product-embeddings.use-case';
import { SearchProductEmbeddingsQueryDto } from '../dto/search-product-embeddings-query.dto';

@Controller('product-embeddings')
export class ProductEmbeddingsSearchController {
  constructor(private readonly search: SearchProductEmbeddingsUseCase) {}

  @Get('search')
  async searchByNeed(@Query() query: SearchProductEmbeddingsQueryDto) {
    const items = await this.search.execute({
      query: query.q,
      limit: query.limit,
    });
    return { items };
  }
}
