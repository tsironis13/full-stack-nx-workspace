import { IsArray, IsInt, IsOptional } from 'class-validator';

import { PaginationDto } from '@full-stack-nx-workspace/api';

export class ProductsCatalogPostDto extends PaginationDto {
  @IsInt()
  categoryId: number;

  @IsArray()
  @IsOptional()
  filters: { attributeId: number; values: number[] }[];
}
