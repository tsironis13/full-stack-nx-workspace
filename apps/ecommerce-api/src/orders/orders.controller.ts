import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { SupabaseAuthGuard } from '@full-stack-nx-workspace/auth';

@Controller('orders')
export class OrdersController {
  @UseGuards(SupabaseAuthGuard)
  @Post('/myorder')
  login(@Body() req: { id: string | number }): Promise<unknown> {
    return new Promise((resolve) => {
      resolve({
        id: req.id,
        name: 'Order 1',
        price: 100,
      });
    });
  }
}
