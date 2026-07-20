export class OrderHistoryItemDto {
  productItemId: number;
  productId: number;
  productName: string | null;
  productCode: string | null;
  salePrice: number;
  quantity: number;
  canReview: boolean;
  hasReview: boolean;
  reviewId: number | null;
}

export class OrderHistoryOrderDto {
  orderId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderHistoryItemDto[];
}

export class OrderHistoryResponseDto {
  orders: OrderHistoryOrderDto[];
}
