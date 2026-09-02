import { Module } from '@nestjs/common';

import { DrizzleModule } from '../drizzle/drizzle.module';
import { ProductsModule } from '../modules/products/products.module';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { CartModule } from '../modules/cart/cart.module';
import { ReviewsModule } from '../modules/reviews/reviews.module';
import { ProductEmbeddingsModule } from '../modules/product-embeddings/product-embeddings.module';

@Module({
  imports: [
    DrizzleModule,
    ProductsModule,
    AuthModule,
    OrdersModule,
    CartModule,
    ReviewsModule,
    ProductEmbeddingsModule,
  ],
})
export class AppModule {}
