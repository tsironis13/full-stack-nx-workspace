import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ReactiveFormsModule } from '@angular/forms';

import { ProductsCatalogStore } from '../application/public-api';
import {
  CardComponent,
  CardActionsTemplateDirective,
  CardHeaderContentTemplateDirective,
  CardHeaderTemplateDirective,
  CardHeaderComponent,
  ImageComponent,
  CardBodyComponent,
  CardBodyTemplateDirective,
  CardBodyTitleTemplateDirective,
  CardBodyDescriptionTemplateDirective,
  CartQuantityControlComponent,
} from '@full-stack-nx-workspace/shared';

@Component({
  selector: 'app-products-catalog',
  templateUrl: './products-catalog.page.html',
  imports: [
    CardComponent,
    CurrencyPipe,
    CardActionsTemplateDirective,
    CardHeaderTemplateDirective,
    CardHeaderComponent,
    CardHeaderContentTemplateDirective,
    CardBodyComponent,
    CardBodyTemplateDirective,
    CardBodyTitleTemplateDirective,
    CardBodyDescriptionTemplateDirective,
    ImageComponent,
    CartQuantityControlComponent,
    ReactiveFormsModule,
    CheckboxModule,
    RadioButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCatalogPage {
  protected readonly productsCatalogStore = inject(ProductsCatalogStore);

  y = effect(() => {
    console.log(this.productsCatalogStore.productFilters());
  });

  x = effect(() => {
    this.productsCatalogStore
      .productFiltersForm()
      .valueChanges.subscribe((value) => {
        console.log(value);
        this.productsCatalogStore.update({
          page: 2,
          limit: 10,
          filters: {
            ...this.productsCatalogStore.filterQuery().filters,
            categoryId: value?.categoryId ?? 0,
            filter: {
              df: [],
            },
          },
          //this.productsCatalogFiltersStore.updateCatalogFilters(value);
        });
      });
  });
}
