import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class ConvertProductItemQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId!: number;

  @IsOptional()
  @IsString()
  hintText?: string;
}
