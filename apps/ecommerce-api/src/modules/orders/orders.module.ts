import { Module } from '@nestjs/common';

import { SupabaseAuthModule } from '@full-stack-nx-workspace/auth';

import { CartModule } from '../cart/cart.module';
import { OrdersController } from './presentation/controllers/orders.controller';
import { PlaceOrderUseCase } from './application/use-cases/place-order.use-case';
import { GetOrderHistoryUseCase } from './application/use-cases/get-order-history.use-case';
import { OrdersRepository } from './domain/repositories/orders.repository';
import { ProductItemsRepository } from './domain/repositories/product-items.repository';
import { OrderHistoryRepository } from './domain/repositories/order-history.repository';
import { DrizzleOrdersRepository } from './infrastructure/drizzle-orders.repository';
import { DrizzleProductItemsRepository } from './infrastructure/drizzle-product-items.repository';
import { DrizzleOrderHistoryRepository } from './infrastructure/drizzle-order-history.repository';

@Module({
  imports: [SupabaseAuthModule, CartModule],
  controllers: [OrdersController],
  providers: [
    PlaceOrderUseCase,
    GetOrderHistoryUseCase,
    {
      provide: OrdersRepository,
      useClass: DrizzleOrdersRepository,
    },
    {
      provide: ProductItemsRepository,
      useClass: DrizzleProductItemsRepository,
    },
    {
      provide: OrderHistoryRepository,
      useClass: DrizzleOrderHistoryRepository,
    },
  ],
})
export class OrdersModule {}
