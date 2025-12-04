import {
  ChangeDetectionStrategy,
  Component,
  inject,
  WritableSignal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Field, form } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';

import {
  ProductFiltersForm,
  ProductsCatalogStore,
} from '../application/public-api';
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
  PriceRangeSliderComponent,
  PriceRangeDisplayComponent,
  PriceRangeDisplayTemplateDirective,
  PaginatorComponent,
} from '@full-stack-nx-workspace/shared';

@Component({
  selector: 'app-products-catalog',
  templateUrl: './products-catalog.page.html',
  styleUrls: ['./products-catalog.page.scss'],
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
    CheckboxModule,
    RadioButtonModule,
    ButtonModule,
    InputTextModule,
    Field,
    PriceRangeSliderComponent,
    PriceRangeDisplayTemplateDirective,
    PriceRangeDisplayComponent,
    PaginatorComponent,
    ProgressSpinner,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCatalogPage {
  protected readonly productsCatalogStore = inject(ProductsCatalogStore);

  protected readonly signalForm = form(
    this.productsCatalogStore.filtersForm as WritableSignal<ProductFiltersForm>
  );
}
