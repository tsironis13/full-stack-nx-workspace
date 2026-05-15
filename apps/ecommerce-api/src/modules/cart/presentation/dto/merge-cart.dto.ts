import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MergeCartItemDto {
  @IsInt()
  @IsPositive()
  productItemId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  capturedSalePrice!: number;

  @IsString()
  capturedName!: string;

  @IsOptional()
  @IsString()
  capturedImageUrl?: string | null;
}

export class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MergeCartItemDto)
  items!: MergeCartItemDto[];
}
