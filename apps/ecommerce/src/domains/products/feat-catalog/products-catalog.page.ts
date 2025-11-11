import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { ProductsFacade } from '../application/public-api';
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
    ButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCatalogPage implements OnInit {
  protected readonly productsFacade = inject(ProductsFacade);

  ngOnInit(): void {
    this.productsFacade.getProductsPaginatedFilteredBy({ page: 1, limit: 10 });
  }
}
