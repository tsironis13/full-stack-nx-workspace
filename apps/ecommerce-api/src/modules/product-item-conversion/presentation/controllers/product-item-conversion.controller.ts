/**
 * Product Item conversion for Cart Item workflow.
 * Not storefront catalog search (`GET /products/catalog`).
 */
import { Controller, Get, Query } from '@nestjs/common';

import { ConvertProductItemUseCase } from '../../application/use-cases/convert-product-item.use-case';
import { ConvertProductItemQueryDto } from '../dto/convert-product-item-query.dto';

@Controller('product-items')
export class ProductItemConversionController {
  constructor(private readonly convert: ConvertProductItemUseCase) {}

  @Get('conversion')
  convertByProduct(@Query() query: ConvertProductItemQueryDto) {
    return this.convert.execute({
      productId: query.productId,
      hintText: query.hintText?.trim() || undefined,
    });
  }
}
