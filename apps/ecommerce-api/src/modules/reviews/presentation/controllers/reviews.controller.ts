import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { ListProductReviewsUseCase } from '../../application/use-cases/list-product-reviews.use-case';

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(
    private readonly listProductReviewsUseCase: ListProductReviewsUseCase,
  ) {}

  @Get()
  list(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.listProductReviewsUseCase.execute({
      productId,
      page: Math.max(1, page),
      pageSize: Math.min(50, Math.max(1, pageSize)),
    });
  }
}
