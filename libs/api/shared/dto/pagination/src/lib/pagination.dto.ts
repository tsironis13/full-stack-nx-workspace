import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  protected page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  protected limit = 10;
}
