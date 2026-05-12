import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { CatalogListService } from '../../application/catalog-list.service';
import { CatalogSort } from '../../domain/catalog.types';

@Controller('products')
export class CatalogController {
  constructor(private readonly catalogListService: CatalogListService) {}

  /**
   * Root categories for storefront facets (`parent_category_id` IS NULL, not deleted).
   */
  @Get('catalog/category-roots')
  listCategoryRoots() {
    return this.catalogListService.listCategoryRoots();
  }

  @Get('catalog')
  listCatalog(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize: number,
    @Query(
      'sort',
      new DefaultValuePipe(CatalogSort.newest),
      new ParseEnumPipe(CatalogSort)
    )
    sort: CatalogSort,
    @Query('q') q?: string,
    @Query('categoryRootId', new ParseIntPipe({ optional: true }))
    categoryRootId?: number,
    @Query('minSalePrice') minSalePrice?: string,
    @Query('maxSalePrice') maxSalePrice?: string
  ) {
    return this.catalogListService.list({
      page: Math.max(1, page),
      pageSize: Math.min(50, Math.max(1, pageSize)),
      sort,
      q: q?.trim() || undefined,
      categoryRootId,
      minSalePrice,
      maxSalePrice,
    });
  }
}
