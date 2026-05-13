import { Module } from '@nestjs/common';

import { DrizzleModule } from '../drizzle/drizzle.module';
import { ProductsModule } from '../modules/products/products.module';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../modules/orders/orders.module';

@Module({
  imports: [DrizzleModule, ProductsModule, AuthModule, OrdersModule],
})
export class AppModule {}
