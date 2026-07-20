export interface OrderHistoryItem {
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

export interface OrderHistoryOrder {
  orderId: number;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: OrderHistoryItem[];
}
