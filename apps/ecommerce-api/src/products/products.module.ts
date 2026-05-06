import { Module } from '@nestjs/common';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductEmbeddingService } from './product-embedding.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductEmbeddingService],
})
export class ProductsModule {}
