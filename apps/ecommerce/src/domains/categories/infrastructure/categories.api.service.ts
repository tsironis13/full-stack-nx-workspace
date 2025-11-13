import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CategoryAttributeValuesDto } from './models/category-attribute-values.api.model';

@Injectable({ providedIn: 'root' })
export class CategoriesApiService {
  readonly #http = inject(HttpClient);

  public getCategoryFiltersGroupedByAttributeValuesById(
    categoryId: number
  ): Observable<CategoryAttributeValuesDto> {
    return this.#http.get<CategoryAttributeValuesDto>(
      `/api/categories/${categoryId}/filtersGroupedByAttributeValues`
    );
  }
}
