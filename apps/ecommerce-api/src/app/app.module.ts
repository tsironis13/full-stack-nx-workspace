import { Module } from '@nestjs/common';

import { DrizzleModule } from '../drizzle/drizzle.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    DrizzleModule,
    ProductsModule,
    CategoriesModule,
    AuthModule,
    OrdersModule,
  ],
})
export class AppModule {}
