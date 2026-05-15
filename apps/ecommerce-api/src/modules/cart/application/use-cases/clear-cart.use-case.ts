import { Injectable } from '@nestjs/common';

import { CartRepository } from '../../domain/repositories/cart.repository';

@Injectable()
export class ClearCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(userId: string): Promise<void> {
    await this.cartRepository.clearItemsByUserId(userId);
  }
}
