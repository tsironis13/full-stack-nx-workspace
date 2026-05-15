import { Injectable, NotFoundException } from '@nestjs/common';

import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartResponseDto } from '../dto/cart-response.dto';

export interface AddCartItemCommand {
  userId: string;
  productItemId: number;
  quantity: number;
}

export interface ProductItemSnapshot {
  id: number;
  salePrice: number;
  productName: string | null;
  imageUrl: string | null;
}

export abstract class ProductItemSnapshotProvider {
  abstract findById(id: number): Promise<ProductItemSnapshot | null>;
}

@Injectable()
export class AddCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly snapshotProvider: ProductItemSnapshotProvider,
  ) {}

  async execute(command: AddCartItemCommand): Promise<CartResponseDto> {
    const snapshot = await this.snapshotProvider.findById(command.productItemId);

    if (!snapshot) {
      throw new NotFoundException(
        `Product item ${command.productItemId} not found`,
      );
    }

    const cart = await this.cartRepository.addItem({
      userId: command.userId,
      productItemId: command.productItemId,
      quantity: command.quantity,
      capturedSalePrice: snapshot.salePrice,
      capturedName: snapshot.productName ?? '',
      capturedImageUrl: snapshot.imageUrl,
    });

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        id: item.id,
        productItemId: item.productItemId,
        quantity: item.quantity,
        capturedPrice: item.capturedPrice,
        currentPrice: item.currentPrice,
        capturedName: item.capturedName,
        capturedImageUrl: item.capturedImageUrl,
        available: item.available,
      })),
    };
  }
}
