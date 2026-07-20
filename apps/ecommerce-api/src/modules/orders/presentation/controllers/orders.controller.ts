import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { SupabaseAuthGuard } from '@full-stack-nx-workspace/auth';

import { PlaceOrderUseCase } from '../../application/use-cases/place-order.use-case';
import { GetOrderHistoryUseCase } from '../../application/use-cases/get-order-history.use-case';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OptionalJwtGuard } from '../guards/optional-jwt.guard';

type AuthedRequest = { user: { id: string } & Record<string, unknown> };

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly placeOrderUseCase: PlaceOrderUseCase,
    private readonly getOrderHistoryUseCase: GetOrderHistoryUseCase,
  ) {}

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

  @UseGuards(SupabaseAuthGuard)
  @Get()
  history(@Request() req: AuthedRequest) {
    return this.getOrderHistoryUseCase.execute({ userId: req.user.id });
  }
}
