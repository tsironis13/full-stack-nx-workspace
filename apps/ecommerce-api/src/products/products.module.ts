import { Module } from '@nestjs/common';

import { CatalogController } from './catalog.controller';
import { CatalogListService } from './catalog-list.service';
import { CatalogRepository } from './catalog.repository';

@Module({
  controllers: [CatalogController],
  providers: [CatalogListService, CatalogRepository],
})
export class ProductsModule {}
