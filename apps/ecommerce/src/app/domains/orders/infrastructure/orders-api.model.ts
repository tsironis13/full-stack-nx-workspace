export interface OrderHistoryItemWire {
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

export interface OrderHistoryOrderWire {
  orderId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderHistoryItemWire[];
}

export interface OrderHistoryResponseWire {
  orders: OrderHistoryOrderWire[];
}
