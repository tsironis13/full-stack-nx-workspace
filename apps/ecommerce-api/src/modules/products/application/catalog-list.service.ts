import { BadRequestException, Injectable } from '@nestjs/common';

import { CatalogRepository } from '../infrastructure/catalog.repository';
import {
  AttributeFilter,
  CatalogListQuery,
  CatalogListServiceInput,
} from '../domain/catalog.types';
import { CatalogListResponseDto } from './dto/catalog-list-response.dto';

@Injectable()
export class CatalogListService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async listCategoryRoots(): Promise<{ roots: { id: number; name: string | null }[] }> {
    const roots = await this.catalogRepository.findActiveRootCategories();
    return { roots };
  }

  async list(query: CatalogListServiceInput): Promise<CatalogListResponseDto> {
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

    const { salePriceMin, salePriceMax } = this.parseSalePriceRange(
      query.minSalePrice,
      query.maxSalePrice
    );

    const attributeFilters = this.parseAttributeFilters(query.rawAttributeFilters);

    const facetParams = {
      q: query.q,
      categoryRootId: query.categoryRootId,
      salePriceMin,
      salePriceMax,
      attributeFilters,
    };

    const [{ rows, total }, facets] = await Promise.all([
      this.catalogRepository.findCatalogPage({
        page,
        pageSize,
        sort,
        ...facetParams,
      }),
      this.catalogRepository.findAttributeFacets(facetParams),
    ]);

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
      facets,
    };
  }

  private parseSalePriceRange(
    minRaw?: string,
    maxRaw?: string
  ): Pick<CatalogListQuery, 'salePriceMin' | 'salePriceMax'> {
    const salePriceMin = this.parseOptionalPriceParam('minSalePrice', minRaw);
    const salePriceMax = this.parseOptionalPriceParam('maxSalePrice', maxRaw);

    if (
      salePriceMin !== undefined &&
      salePriceMax !== undefined &&
      salePriceMin > salePriceMax
    ) {
      throw new BadRequestException(
        'minSalePrice must be less than or equal to maxSalePrice'
      );
    }

    return { salePriceMin, salePriceMax };
  }

  private parseOptionalPriceParam(
    queryKey: 'minSalePrice' | 'maxSalePrice',
    raw?: string
  ): number | undefined {
    const trimmed = raw?.trim();
    if (!trimmed) {
      return undefined;
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
      throw new BadRequestException(`${queryKey} must be a finite number`);
    }
    if (n < 0) {
      throw new BadRequestException(`${queryKey} must be >= 0`);
    }
    return n;
  }

  /**
   * Parses raw `attributeFilter` query params (format: `"${attributeId}:${valueId}"`)
   * into `AttributeFilter[]`. v1: single-select per attribute — if the same
   * attributeId appears multiple times the last value wins.
   */
  parseAttributeFilters(
    raw: string | string[] | undefined
  ): AttributeFilter[] | undefined {
    if (!raw) {
      return undefined;
    }
    const entries = Array.isArray(raw) ? raw : [raw];
    const filters: AttributeFilter[] = [];
    for (const entry of entries) {
      const parts = entry.split(':');
      if (parts.length !== 2) {
        throw new BadRequestException(
          `attributeFilter values must be in "attributeId:valueId" format; got "${entry}"`
        );
      }
      const attributeId = parseInt(parts[0], 10);
      const valueId = parseInt(parts[1], 10);
      if (!Number.isFinite(attributeId) || attributeId <= 0) {
        throw new BadRequestException(
          `attributeFilter attributeId must be a positive integer; got "${parts[0]}"`
        );
      }
      if (!Number.isFinite(valueId) || valueId <= 0) {
        throw new BadRequestException(
          `attributeFilter valueId must be a positive integer; got "${parts[1]}"`
        );
      }
      filters.push({ attributeId, valueId });
    }
    return filters.length > 0 ? filters : undefined;
  }
}
