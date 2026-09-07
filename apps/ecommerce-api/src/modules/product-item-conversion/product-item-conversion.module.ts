/**
 * Nest module for Product Item conversion used by Cart Item workflow.
 * Matching and Inventory live here; catalog `q` is unchanged.
 */
import { Module } from '@nestjs/common';

import { ConvertProductItemUseCase } from './application/use-cases/convert-product-item.use-case';
import { ProductItemConversionRepository } from './domain/repositories/product-item-conversion.repository';
import { DrizzleProductItemConversionRepository } from './infrastructure/drizzle-product-item-conversion.repository';
import { ProductItemConversionController } from './presentation/controllers/product-item-conversion.controller';

@Module({
  controllers: [ProductItemConversionController],
  providers: [
    ConvertProductItemUseCase,
    {
      provide: ProductItemConversionRepository,
      useClass: DrizzleProductItemConversionRepository,
    },
  ],
  exports: [ConvertProductItemUseCase],
})
export class ProductItemConversionModule {}
