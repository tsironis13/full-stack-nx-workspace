/**
 * Wire/transport types for the Cart API.
 * Must NOT import from `../domain/` — keep HTTP contracts independent from the domain model.
 */

export interface CartItemApiModel {
  /** Server-assigned cart item row ID — used in PATCH/DELETE :cartItemId routes. */
  id: number;
  productItemId: number;
  quantity: number;
  capturedPrice: number;
  currentPrice: number;
  capturedName: string;
  capturedImageUrl: string | null;
  available: boolean;
}

export interface CartApiResponseModel {
  id: number;
  userId: string;
  items: CartItemApiModel[];
}
