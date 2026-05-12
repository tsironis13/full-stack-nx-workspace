import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { CatalogBrowseStore, type CatalogSort } from '../application/public-api';

@Component({
  selector: 'app-catalog-browse-page',
  templateUrl: './catalog-browse.page.html',
  styleUrl: './catalog-browse.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    FormsModule,
    PaginatorModule,
    ProgressSpinnerModule,
  ],
})
export class CatalogBrowsePageComponent implements OnInit {
  protected readonly store = inject(CatalogBrowseStore);

  /** Bound to search input before apply. */
  readonly searchDraft = signal('');

  protected readonly sortOptions: { value: CatalogSort; label: string }[] = [
    { value: 'newest', label: 'Νεότερα' },
    { value: 'price_asc', label: 'Τιμή (αύξουσα)' },
    { value: 'price_desc', label: 'Τιμή (φθίνουσα)' },
  ];

  readonly placeholderImage =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240"><rect width="320" height="240" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="system-ui" font-size="14">Εικόνα</text></svg>'
    );

  ngOnInit(): void {
    this.store.loadCategoryRoots();
    this.store.load();
  }

  protected selectCategoryRoot(categoryRootId: number | null): void {
    this.store.setCategoryRoot(categoryRootId);
  }

  protected onImageError(event: Event): void {
    const el = event.target;
    if (el instanceof HTMLImageElement) {
      el.src = this.placeholderImage;
    }
  }

  protected applySearch(): void {
    this.store.setSearchQuery(this.searchDraft().trim());
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

  protected rangeLabel(
    page: number,
    pageSize: number,
    total: number
  ): string {
    if (total === 0) {
      return 'Κανένα προϊόν';
    }
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return `Εμφάνιση ${from}–${to} από ${total} προϊόντα`;
  }
}
