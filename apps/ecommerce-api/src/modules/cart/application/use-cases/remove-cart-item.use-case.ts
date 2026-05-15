import { Injectable } from '@nestjs/common';

import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartResponseDto } from '../dto/cart-response.dto';

export interface RemoveCartItemCommand {
  userId: string;
  cartItemId: number;
}

@Injectable()
export class RemoveCartItemUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(command: RemoveCartItemCommand): Promise<CartResponseDto> {
    const cart = await this.cartRepository.removeItem({
      userId: command.userId,
      cartItemId: command.cartItemId,
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
