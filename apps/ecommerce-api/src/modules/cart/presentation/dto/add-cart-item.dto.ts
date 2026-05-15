import { IsInt, IsPositive } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  @IsPositive()
  productItemId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
