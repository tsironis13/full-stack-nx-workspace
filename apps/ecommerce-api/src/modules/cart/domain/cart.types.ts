export interface CartItem {
  id: number;
  cartId: number;
  productItemId: number;
  quantity: number;
  capturedPrice: number;
  capturedName: string;
  capturedImageUrl: string | null;
  currentPrice: number;
  available: boolean;
}

export interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
}
