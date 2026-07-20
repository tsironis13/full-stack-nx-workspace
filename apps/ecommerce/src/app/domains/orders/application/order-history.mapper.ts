import type { OrderHistoryOrder } from '../domain/public-api';
import type { OrderHistoryResponseWire } from '../infrastructure/public-api';

export function mapOrderHistoryFromWire(
  wire: OrderHistoryResponseWire,
): OrderHistoryOrder[] {
  return wire.orders.map((order) => ({
    orderId: Number(order.orderId),
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: new Date(order.createdAt),
    items: order.items.map((item) => ({
      productItemId: Number(item.productItemId),
      productId: Number(item.productId),
      productName: item.productName,
      productCode: item.productCode,
      salePrice: Number(item.salePrice),
      quantity: Number(item.quantity),
      canReview: item.canReview,
      hasReview: item.hasReview,
      reviewId: item.reviewId == null ? null : Number(item.reviewId),
    })),
  }));
}
