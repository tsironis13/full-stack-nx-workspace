export interface CartItemDto {
  id: number;
  productItemId: number;
  quantity: number;
  capturedPrice: number;
  currentPrice: number;
  capturedName: string;
  capturedImageUrl: string | null;
  available: boolean;
}

export interface CartResponseDto {
  id: number;
  userId: string;
  items: CartItemDto[];
}
