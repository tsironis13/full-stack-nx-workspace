import { BadRequestException, Injectable } from '@nestjs/common';

import { CatalogRepository } from '../infrastructure/catalog.repository';
import { CatalogListQuery } from '../domain/catalog.types';
import { CatalogListResponseDto } from './dto/catalog-list-response.dto';

@Injectable()
export class CatalogListService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async listCategoryRoots(): Promise<{ roots: { id: number; name: string | null }[] }> {
    const roots = await this.catalogRepository.findActiveRootCategories();
    return { roots };
  }

  async list(query: CatalogListQuery): Promise<CatalogListResponseDto> {
    const page = query.page;
    const pageSize = query.pageSize;
    const sort = query.sort;

    if (query.categoryRootId !== undefined) {
      const ok = await this.catalogRepository.isActiveRootCategory(
        query.categoryRootId
      );
      if (!ok) {
        throw new BadRequestException(
          'categoryRootId must reference an active root category'
        );
      }
    }

    const { rows, total } = await this.catalogRepository.findCatalogPage({
      page,
      pageSize,
      sort,
      q: query.q,
      categoryRootId: query.categoryRootId,
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
