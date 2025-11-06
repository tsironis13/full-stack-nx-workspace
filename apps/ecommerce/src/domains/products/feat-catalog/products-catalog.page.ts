import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';

import { ProductsFacade } from '../application/public-api';
import { CardComponent } from '@full-stack-nx-workspace/shared';

@Component({
  selector: 'app-products-catalog',
  templateUrl: './products-catalog.page.html',
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCatalogPage implements OnInit {
  protected readonly productsFacade = inject(ProductsFacade);

  ngOnInit(): void {
    this.productsFacade.getProductsPaginatedFilteredBy({ page: 1, limit: 10 });
  }
}
