import { deriveOrderItemReviewStatus } from '../domain/order-history.rules';
import type { OrderHistoryOrderRecord } from '../domain/order-history.types';
import {
  OrderHistoryOrderDto,
  OrderHistoryResponseDto,
} from './dto/order-history-response.dto';

function toOrderDto(record: OrderHistoryOrderRecord): OrderHistoryOrderDto {
  return {
    orderId: record.id,
    status: record.status,
    totalAmount: record.totalAmount,
    createdAt: (record.createdAt ?? new Date()).toISOString(),
    items: record.items.map((item) => {
      const status = deriveOrderItemReviewStatus(item.visibleReviewId);
      return {
        productItemId: item.productItemId,
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        salePrice: item.salePrice,
        quantity: item.quantity,
        canReview: status.canReview,
        hasReview: status.hasReview,
        reviewId: status.reviewId,
      };
    }),
  };
}

export function toOrderHistoryResponse(
  records: OrderHistoryOrderRecord[],
): OrderHistoryResponseDto {
  return { orders: records.map(toOrderDto) };
}
