import { IsInt, IsOptional } from 'class-validator';

import { PriceRangeFilterPostDto } from './price-range-filter.post.dto';

export class ProductsCatalogFiltersPostDto {
  @IsInt()
  categoryId: number;

  @IsOptional()
  priceRange: PriceRangeFilterPostDto;
}
