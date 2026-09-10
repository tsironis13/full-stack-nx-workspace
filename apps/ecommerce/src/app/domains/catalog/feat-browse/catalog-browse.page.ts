import { Component, inject, OnInit } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  ButtonDirective,
  PaginatorComponent,
  SpinnerComponent,
  type PaginatorPageChange,
} from '@full-stack-nx-workspace/shared';

import {
  CatalogBrowseStore,
  type CatalogSort,
} from '../application/public-api';
import { CatalogAttributeFacetsComponent } from './catalog-attribute-facets/catalog-attribute-facets.component';
import { CatalogBrowseToolbarComponent } from './catalog-browse-toolbar/catalog-browse-toolbar.component';
import { CatalogCategoryFacetComponent } from './catalog-category-facet/catalog-category-facet.component';
import { CatalogMinRatingFacetComponent } from './catalog-min-rating-facet/catalog-min-rating-facet.component';
import { CatalogPriceBandComponent } from './catalog-price-band/catalog-price-band.component';
import { CatalogProductCardComponent } from './catalog-product-card/catalog-product-card.component';

@Component({
  selector: 'app-catalog-browse-page',
  templateUrl: './catalog-browse.page.html',
  styleUrl: './catalog-browse.page.scss',
  imports: [
    ButtonDirective,
    CatalogAttributeFacetsComponent,
    CatalogBrowseToolbarComponent,
    CatalogCategoryFacetComponent,
    CatalogMinRatingFacetComponent,
    CatalogPriceBandComponent,
    CatalogProductCardComponent,
    PaginatorComponent,
    SpinnerComponent,
    TranslocoPipe,
  ],
})
export class CatalogBrowsePageComponent implements OnInit {
  protected readonly store = inject(CatalogBrowseStore);
  protected readonly pageSizeOptions = [12, 24, 48];

  protected readonly sortOptions: { value: CatalogSort; labelKey: string }[] = [
    { value: 'newest', labelKey: 'catalog.sort.newest' },
    { value: 'price_asc', labelKey: 'catalog.sort.priceAsc' },
    { value: 'price_desc', labelKey: 'catalog.sort.priceDesc' },
    { value: 'rating_desc', labelKey: 'catalog.sort.ratingDesc' },
  ];

  ngOnInit(): void {
    this.store.loadCategoryRoots();
    this.store.load();
  }

  protected onSearchApplied(query: string): void {
    this.store.setSearchQuery(query);
    this.store.setPage(1);
    this.store.load();
  }

  protected onSortChange(value: CatalogSort): void {
    this.store.setSort(value);
    this.store.setPage(1);
    this.store.load();
  }

  protected onPageChange({ page, pageSize }: PaginatorPageChange): void {
    this.store.setPage(page);
    this.store.setPageSize(pageSize);
    this.store.load();
  }
}
