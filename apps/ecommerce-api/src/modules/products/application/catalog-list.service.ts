import { Injectable } from '@nestjs/common';

import { CatalogRepository } from '../infrastructure/catalog.repository';
import { CatalogListQuery } from '../domain/catalog.types';
import { CatalogListResponseDto } from './dto/catalog-list-response.dto';

@Injectable()
export class CatalogListService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async list(query: CatalogListQuery): Promise<CatalogListResponseDto> {
    const page = query.page;
    const pageSize = query.pageSize;
    const sort = query.sort;

    const { rows, total } = await this.catalogRepository.findCatalogPage({
      page,
      pageSize,
      sort,
      q: query.q,
    });

    return {
      items: rows.map((r) => ({
        productId: r.productId,
        name: r.name,
        mainProductItemId: r.mainProductItemId,
        salePrice: r.salePrice,
        originalPrice: r.originalPrice,
        primaryImageUrl: r.primaryImageUrl,
        additionalOptionsCount: r.additionalOptionsCount,
      })),
      total,
      page,
      pageSize,
    };
  }
}
