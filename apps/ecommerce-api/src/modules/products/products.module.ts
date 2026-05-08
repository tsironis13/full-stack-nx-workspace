import { Module } from '@nestjs/common';

import { CatalogController } from './presentation/controllers/catalog.controller';
import { CatalogListService } from './application/catalog-list.service';
import { CatalogRepository } from './infrastructure/catalog.repository';

@Module({
  controllers: [CatalogController],
  providers: [CatalogListService, CatalogRepository],
})
export class ProductsModule {}
