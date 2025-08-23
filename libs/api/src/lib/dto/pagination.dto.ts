import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit = 20;
}
