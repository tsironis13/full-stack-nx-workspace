import { IsBoolean, IsNumber } from 'class-validator';

export class PriceRangeFilterPostDto {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;

  @IsBoolean()
  overMax: boolean;
}
