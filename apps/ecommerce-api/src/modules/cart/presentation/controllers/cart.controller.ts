import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { GetCartUseCase } from '../../application/use-cases/get-cart.use-case';
import { AddCartItemUseCase } from '../../application/use-cases/add-cart-item.use-case';
import { UpdateCartItemUseCase } from '../../application/use-cases/update-cart-item.use-case';
import { RemoveCartItemUseCase } from '../../application/use-cases/remove-cart-item.use-case';
import { MergeCartUseCase } from '../../application/use-cases/merge-cart.use-case';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { MergeCartDto } from '../dto/merge-cart.dto';
import { SupabaseAuthGuard } from '@full-stack-nx-workspace/auth';

@UseGuards(SupabaseAuthGuard)
@Controller('cart')
export class CartController {
  constructor(
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addCartItemUseCase: AddCartItemUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeCartItemUseCase: RemoveCartItemUseCase,
    private readonly mergeCartUseCase: MergeCartUseCase,
  ) {}

  @Get()
  getCart(@Request() req: { user: { id: string } }) {
    return this.getCartUseCase.execute(req.user.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  addItem(
    @Body() dto: AddCartItemDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.addCartItemUseCase.execute({
      userId: req.user.id,
      productItemId: dto.productItemId,
      quantity: dto.quantity,
    });
  }

  @Patch('items/:cartItemId')
  updateItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() dto: UpdateCartItemDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.updateCartItemUseCase.execute({
      userId: req.user.id,
      cartItemId,
      quantity: dto.quantity,
    });
  }

  @Delete('items/:cartItemId')
  removeItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Request() req: { user: { id: string } },
  ) {
    return this.removeCartItemUseCase.execute({
      userId: req.user.id,
      cartItemId,
    });
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  merge(
    @Body() dto: MergeCartDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.mergeCartUseCase.execute({
      userId: req.user.id,
      items: dto.items.map((item) => ({
        productItemId: item.productItemId,
        quantity: item.quantity,
        capturedSalePrice: item.capturedSalePrice,
        capturedName: item.capturedName,
        capturedImageUrl: item.capturedImageUrl ?? null,
      })),
    });
  }
}
