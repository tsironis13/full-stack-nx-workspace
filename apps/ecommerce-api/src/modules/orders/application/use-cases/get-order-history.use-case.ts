import { Injectable } from '@nestjs/common';

import { OrderHistoryRepository } from '../../domain/repositories/order-history.repository';
import { OrderHistoryResponseDto } from '../dto/order-history-response.dto';
import { toOrderHistoryResponse } from '../order-history.mapper';

export interface GetOrderHistoryQuery {
  userId: string;
}

@Injectable()
export class GetOrderHistoryUseCase {
  constructor(
    private readonly orderHistoryRepository: OrderHistoryRepository,
  ) {}

  async execute(query: GetOrderHistoryQuery): Promise<OrderHistoryResponseDto> {
    const orders =
      await this.orderHistoryRepository.findConfirmedOrdersWithReviewStatus({
        userId: query.userId,
      });

    return toOrderHistoryResponse(orders);
  }
}
