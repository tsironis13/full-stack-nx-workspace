import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrdersRepository } from '../../domain/repositories/orders.repository';
import { PlaceOrderResponseDto } from '../dto/place-order-response.dto';
import { ProductItemsRepository } from '../../domain/repositories/product-items.repository';

export interface PlaceOrderCommand {
  userId: string | null;
  guestEmail: string | null;
  shippingAddress: {
    fullName: string;
    streetAddress: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: { productItemId: number; quantity: number }[];
}

@Injectable()
export class PlaceOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productItemsRepository: ProductItemsRepository
  ) {}

  async execute(command: PlaceOrderCommand): Promise<PlaceOrderResponseDto> {
    this.validateIdentity(command.userId, command.guestEmail);

    const productItemIds = command.items.map((i) => i.productItemId);
    const productItems =
      await this.productItemsRepository.findByIds(productItemIds);

    for (const requestedItem of command.items) {
      const found = productItems.find(
        (p) => p.id === requestedItem.productItemId
      );
      if (!found) {
        throw new NotFoundException(
          `Product item ${requestedItem.productItemId} not found`
        );
      }
    }

    const orderItemsPayload = command.items.map((requestedItem) => {
      const dbItem = productItems.find(
        (p) => p.id === requestedItem.productItemId
      )!;
      return {
        productItemId: requestedItem.productItemId,
        productName: dbItem.productName,
        productCode: dbItem.sku,
        salePrice: dbItem.salePrice,
        originalPrice: dbItem.originalPrice,
        quantity: requestedItem.quantity,
      };
    });

    const totalAmount = orderItemsPayload.reduce(
      (sum, item) => sum + item.salePrice * item.quantity,
      0
    );

    const shippingAddressJson = JSON.stringify(command.shippingAddress);

    const order = await this.ordersRepository.createOrder({
      userId: command.userId,
      guestEmail: command.guestEmail,
      shippingAddress: shippingAddressJson,
      totalAmount,
      items: orderItemsPayload,
    });

    return {
      orderId: order.id,
      status: 'confirmed',
      totalAmount: order.totalAmount,
      createdAt: order.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private validateIdentity(
    userId: string | null,
    guestEmail: string | null
  ): void {
    const hasUser = !!userId;
    const hasGuest = !!guestEmail;

    if (!hasUser && !hasGuest) {
      throw new BadRequestException(
        'Either userId or guestEmail must be provided'
      );
    }

    if (hasUser && hasGuest) {
      throw new BadRequestException(
        'Only one of userId or guestEmail may be set — not both'
      );
    }
  }
}
