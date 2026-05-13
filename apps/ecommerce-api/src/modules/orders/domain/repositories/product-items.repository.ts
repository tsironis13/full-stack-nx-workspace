export interface ProductItemRecord {
  id: number;
  sku: string | null;
  salePrice: number;
  originalPrice: number;
  productName: string | null;
}

export abstract class ProductItemsRepository {
  abstract findByIds(ids: number[]): Promise<ProductItemRecord[]>;
}
