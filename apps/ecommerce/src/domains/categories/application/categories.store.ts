import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { distinctUntilChanged, pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

import { CategoriesDataService } from '../data/public-api';

type CategoriesState = {
  categoryFilters: {
    attributeId: number;
    attributeName: string;
    values: {
      valueId: number;
      valueName: string;
      productItemsCount?: number;
    }[];
  }[];
};

const initialState: CategoriesState = {
  categoryFilters: [],
};

export const CategoriesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, categoriesService = inject(CategoriesDataService)) => ({
    getCategoryFiltersGroupedByAttributeValuesById: rxMethod<number>(
      pipe(
        distinctUntilChanged(),
        switchMap((categoryId) => {
          return categoriesService
            .getCategoryFiltersViewModelGroupedByAttributeValuesById(categoryId)
            .pipe(
              tapResponse({
                next: (categoryFiltersViewModel) =>
                  patchState(store, {
                    categoryFilters: categoryFiltersViewModel,
                  }),
                error: (err) => {
                  patchState(store, { categoryFilters: [] });
                  console.error(err);
                },
              })
            );
        })
      )
    ),
  }))
);
