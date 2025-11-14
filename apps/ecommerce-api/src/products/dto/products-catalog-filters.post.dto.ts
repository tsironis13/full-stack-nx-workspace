import { IsInt, IsOptional } from 'class-validator';

export class ProductsCatalogFiltersPostDto {
  @IsInt()
  categoryId: number;

  @IsOptional()
  filter: Record<string, []>;
}
