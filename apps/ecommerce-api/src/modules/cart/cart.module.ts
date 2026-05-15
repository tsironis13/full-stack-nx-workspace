import { Module } from '@nestjs/common';

import { SupabaseAuthModule } from '@full-stack-nx-workspace/auth';

import { CartController } from './presentation/controllers/cart.controller';
import { GetCartUseCase } from './application/use-cases/get-cart.use-case';
import { AddCartItemUseCase } from './application/use-cases/add-cart-item.use-case';
import { UpdateCartItemUseCase } from './application/use-cases/update-cart-item.use-case';
import { RemoveCartItemUseCase } from './application/use-cases/remove-cart-item.use-case';
import { ClearCartUseCase } from './application/use-cases/clear-cart.use-case';
import { CartRepository } from './domain/repositories/cart.repository';
import { ProductItemSnapshotProvider } from './application/use-cases/add-cart-item.use-case';
import { DrizzleCartRepository } from './infrastructure/drizzle-cart.repository';
import { DrizzleProductItemSnapshotProvider } from './infrastructure/drizzle-product-item-snapshot.provider';

@Module({
  imports: [SupabaseAuthModule],
  controllers: [CartController],
  providers: [
    GetCartUseCase,
    AddCartItemUseCase,
    UpdateCartItemUseCase,
    RemoveCartItemUseCase,
    ClearCartUseCase,
    {
      provide: CartRepository,
      useClass: DrizzleCartRepository,
    },
    {
      provide: ProductItemSnapshotProvider,
      useClass: DrizzleProductItemSnapshotProvider,
    },
  ],
  exports: [ClearCartUseCase],
})
export class CartModule {}
