import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { CategoriesApiService } from '../infrastructure/public-api';
import { categoryFiltersDtoToCategoryFiltersViewModel } from './categories-ui.mapper';

@Injectable({ providedIn: 'root' })
export class CategoriesDataService {
  readonly #categoriesApiService = inject(CategoriesApiService);

  public getCategoryFiltersViewModelGroupedByAttributeValuesById(
    categoryId: number
  ) {
    return this.#categoriesApiService
      .getCategoryFiltersGroupedByAttributeValuesById(categoryId)
      .pipe(
        map((categoryAttributeValues) =>
          categoryFiltersDtoToCategoryFiltersViewModel(categoryAttributeValues)
        )
      );
  }
}
