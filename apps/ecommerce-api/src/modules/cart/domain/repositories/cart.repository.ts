import { Cart } from '../cart.types';

export abstract class CartRepository {
  abstract getCartByUserId(userId: string): Promise<Cart>;

  abstract addItem(params: {
    userId: string;
    productItemId: number;
    quantity: number;
    capturedSalePrice: number;
    capturedName: string;
    capturedImageUrl: string | null;
  }): Promise<Cart>;

  abstract updateItemQuantity(params: {
    userId: string;
    cartItemId: number;
    quantity: number;
  }): Promise<Cart>;

  abstract removeItem(params: {
    userId: string;
    cartItemId: number;
  }): Promise<Cart>;

  abstract clearItemsByUserId(userId: string): Promise<void>;

  abstract mergeItems(params: {
    userId: string;
    items: Array<{
      productItemId: number;
      quantity: number;
      capturedSalePrice: number;
      capturedName: string;
      capturedImageUrl?: string | null;
    }>;
  }): Promise<Cart>;
}
