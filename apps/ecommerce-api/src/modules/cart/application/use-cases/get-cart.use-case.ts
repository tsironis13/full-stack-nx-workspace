import { Injectable } from '@nestjs/common';

import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartResponseDto } from '../dto/cart-response.dto';

@Injectable()
export class GetCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.getCartByUserId(userId);

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
