import { Module } from '@nestjs/common';

import { SupabaseAuthModule } from '@full-stack-nx-workspace/auth';

import { CartModule } from '../cart/cart.module';
import { OrdersController } from './presentation/controllers/orders.controller';
import { PlaceOrderUseCase } from './application/use-cases/place-order.use-case';
import { OrdersRepository } from './domain/repositories/orders.repository';
import { ProductItemsRepository } from './domain/repositories/product-items.repository';
import { DrizzleOrdersRepository } from './infrastructure/drizzle-orders.repository';
import { DrizzleProductItemsRepository } from './infrastructure/drizzle-product-items.repository';

@Module({
  imports: [SupabaseAuthModule, CartModule],
  controllers: [OrdersController],
  providers: [
    PlaceOrderUseCase,
    {
      provide: OrdersRepository,
      useClass: DrizzleOrdersRepository,
    },
    {
      provide: ProductItemsRepository,
      useClass: DrizzleProductItemsRepository,
    },
  ],
})
export class OrdersModule {}
