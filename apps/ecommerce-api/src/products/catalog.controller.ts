import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { CatalogListService } from './catalog-list.service';
import { CatalogSort } from './catalog.types';

@Controller('products')
export class CatalogController {
  constructor(private readonly catalogListService: CatalogListService) {}

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
    @Query('q') q?: string
  ) {
    return this.catalogListService.list({
      page: Math.max(1, page),
      pageSize: Math.min(50, Math.max(1, pageSize)),
      sort,
      q: q?.trim() || undefined,
    });
  }
}
