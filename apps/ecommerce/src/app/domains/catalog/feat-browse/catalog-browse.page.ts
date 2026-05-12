import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { CatalogBrowseStore, type CatalogSort } from '../application/public-api';

import { CatalogAttributeFacetsComponent } from './catalog-attribute-facets/catalog-attribute-facets.component';
import { CatalogBrowseToolbarComponent } from './catalog-browse-toolbar/catalog-browse-toolbar.component';
import { CatalogCategoryFacetComponent } from './catalog-category-facet/catalog-category-facet.component';
import { CatalogPriceBandComponent } from './catalog-price-band/catalog-price-band.component';
import { CatalogProductCardComponent } from './catalog-product-card/catalog-product-card.component';

@Component({
  selector: 'app-catalog-browse-page',
  templateUrl: './catalog-browse.page.html',
  styleUrl: './catalog-browse.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CatalogAttributeFacetsComponent,
    CatalogBrowseToolbarComponent,
    CatalogCategoryFacetComponent,
    CatalogPriceBandComponent,
    CatalogProductCardComponent,
    PaginatorModule,
    ProgressSpinnerModule,
  ],
})
export class CatalogBrowsePageComponent implements OnInit {
  protected readonly store = inject(CatalogBrowseStore);

  protected readonly sortOptions: { value: CatalogSort; label: string }[] = [
    { value: 'newest', label: 'Νεότερα' },
    { value: 'price_asc', label: 'Τιμή (αύξουσα)' },
    { value: 'price_desc', label: 'Τιμή (φθίνουσα)' },
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

  protected onPageChange(state: PaginatorState): void {
    const nextPage = (state.page ?? 0) + 1;
    const rows = state.rows ?? this.store.pageSize();
    this.store.setPage(nextPage);
    this.store.setPageSize(rows);
    this.store.load();
  }

  protected rangeLabel(page: number, pageSize: number, total: number): string {
    if (total === 0) {
      return 'Κανένα προϊόν';
    }
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return `Εμφάνιση ${from}–${to} από ${total} προϊόντα`;
  }
}
