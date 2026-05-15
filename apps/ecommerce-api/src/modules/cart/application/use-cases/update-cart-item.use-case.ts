import { BadRequestException, Injectable } from '@nestjs/common';

import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartResponseDto } from '../dto/cart-response.dto';

export interface UpdateCartItemCommand {
  userId: string;
  cartItemId: number;
  quantity: number;
}

@Injectable()
export class UpdateCartItemUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(command: UpdateCartItemCommand): Promise<CartResponseDto> {
    if (command.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const cart = await this.cartRepository.updateItemQuantity({
      userId: command.userId,
      cartItemId: command.cartItemId,
      quantity: command.quantity,
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
