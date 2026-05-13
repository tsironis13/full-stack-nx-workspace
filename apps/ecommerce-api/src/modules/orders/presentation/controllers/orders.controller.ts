import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { PlaceOrderUseCase } from '../../application/use-cases/place-order.use-case';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OptionalJwtGuard } from '../guards/optional-jwt.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly placeOrderUseCase: PlaceOrderUseCase) {}

  @UseGuards(OptionalJwtGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    const userId: string | null = req.user?.id ?? null;
    const guestEmail = userId ? null : (dto.guestEmail ?? null);

    return this.placeOrderUseCase.execute({
      userId,
      guestEmail,
      shippingAddress: dto.shippingAddress,
      items: dto.items,
    });
  }
}
