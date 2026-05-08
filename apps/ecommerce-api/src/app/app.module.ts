import { Module } from '@nestjs/common';

import { DrizzleModule } from '../drizzle/drizzle.module';
import { ProductsModule } from '../modules/products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DrizzleModule, ProductsModule, AuthModule],
})
export class AppModule {}
