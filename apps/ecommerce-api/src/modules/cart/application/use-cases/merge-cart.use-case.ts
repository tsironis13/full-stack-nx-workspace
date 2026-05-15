import { Injectable } from '@nestjs/common';

import { CartRepository } from '../../domain/repositories/cart.repository';
import { Cart } from '../../domain/cart.types';
import { CartResponseDto } from '../dto/cart-response.dto';

export interface MergeCartItemCommand {
  productItemId: number;
  quantity: number;
  capturedSalePrice: number;
  capturedName: string;
  capturedImageUrl?: string | null;
}

export interface MergeCartCommand {
  userId: string;
  items: MergeCartItemCommand[];
}

export abstract class ProductItemExistenceChecker {
  abstract isActive(productItemId: number): Promise<boolean>;
}

@Injectable()
export class MergeCartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly existenceChecker: ProductItemExistenceChecker,
  ) {}

  async execute(command: MergeCartCommand): Promise<CartResponseDto> {
    if (command.items.length === 0) {
      const cart = await this.cartRepository.getCartByUserId(command.userId);
      return this.mapCartToDto(cart);
    }

    const validItems: MergeCartItemCommand[] = [];
    for (const item of command.items) {
      if (await this.existenceChecker.isActive(item.productItemId)) {
        validItems.push(item);
      }
    }

    const cart = await this.cartRepository.mergeItems({
      userId: command.userId,
      items: validItems,
    });

    return this.mapCartToDto(cart);
  }

  private mapCartToDto(cart: Cart): CartResponseDto {
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
