import { Component, inject, OnInit } from '@angular/core';

import { ProductsDataService } from '../data/public-api';

@Component({
  selector: 'app-products-catalog',
  templateUrl: './products-catalog.page.html',
})
export class ProductsCatalogPage implements OnInit {
  readonly #productsDataService = inject(ProductsDataService);

  ngOnInit(): void {
    this.#productsDataService
      .getPaginatedFilteredBy({ page: 1, limit: 10 })
      .subscribe((products) => {
        console.log(products);
      });
  }
}
