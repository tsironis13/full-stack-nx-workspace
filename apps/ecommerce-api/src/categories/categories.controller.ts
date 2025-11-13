import { Controller, Get, Param } from '@nestjs/common';

import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/:id/filtersGroupedByAttributeValues')
  getCategoryFiltersGroupedByAttributeValuesById(@Param('id') id: string) {
    return this.categoriesService.getCategoryFiltersGroupedByAttributeValuesById(
      +id
    );
  }
}
