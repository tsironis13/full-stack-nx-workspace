/**
 * Resolves a Product (plus optional option hints) to a unique In Stock
 * Product Item, or a picker / not-found / all-out-of-stock result.
 * Owned by ecommerce-api; Mastra is an HTTP client only.
 */
import { Injectable } from '@nestjs/common';

import { matchProductItem } from '../../domain/match-product-item';
import { ProductItemConversionRepository } from '../../domain/repositories/product-item-conversion.repository';
import type { ConvertProductItemResult } from '../../domain/product-item-conversion.types';

export type ConvertProductItemCommand = {
  productId: number;
  hintText?: string;
};

@Injectable()
export class ConvertProductItemUseCase {
  constructor(
    private readonly repository: ProductItemConversionRepository,
  ) {}

  async execute(
    command: ConvertProductItemCommand,
  ): Promise<ConvertProductItemResult> {
    const product = await this.repository.findByProductId(command.productId);
    if (!product) {
      return { status: 'not_found' };
    }
    return matchProductItem(product, command.hintText);
  }
}
