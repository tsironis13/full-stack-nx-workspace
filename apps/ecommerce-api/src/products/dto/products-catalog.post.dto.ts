import { IsArray, IsInt, IsOptional } from 'class-validator';

import { PaginationDto } from '@full-stack-nx-workspace/api';
import { PriceRangeFilterPostDto } from './price-range-filter.post.dto';

export class ProductsCatalogPostDto extends PaginationDto {
  @IsInt()
  categoryId: number;

  @IsArray()
  @IsOptional()
  filters: { attributeId: number; values: number[] }[];

  @IsOptional()
  priceRange: PriceRangeFilterPostDto;
}
