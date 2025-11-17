import {
  ChangeDetectionStrategy,
  Component,
  inject,
  WritableSignal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Control, form } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

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
    CheckboxModule,
    RadioButtonModule,
    ButtonModule,
    InputTextModule,
    Control,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCatalogPage {
  protected readonly productsCatalogStore = inject(ProductsCatalogStore);

  protected readonly signalForm = form(
    this.productsCatalogStore.filtersForm as WritableSignal<ProductFiltersForm>
  );
}
