import type { ConversionProduct } from '../product-item-conversion.types';

export abstract class ProductItemConversionRepository {
  abstract findByProductId(productId: number): Promise<ConversionProduct | null>;
}
