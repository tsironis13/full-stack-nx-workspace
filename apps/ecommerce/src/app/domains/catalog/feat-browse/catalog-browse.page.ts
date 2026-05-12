import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  PriceRangeDisplayComponent,
  PriceRangeDisplayTemplateDirective,
  PriceRangeSliderComponent,
} from '@full-stack-nx-workspace/shared';

import { CatalogBrowseStore, type CatalogSort } from '../application/public-api';

const PRICE_SLIDER_FLOOR = 0;
const PRICE_SLIDER_CEIL = 10_000;

@Component({
  selector: 'app-catalog-browse-page',
  templateUrl: './catalog-browse.page.html',
  styleUrl: './catalog-browse.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    FormsModule,
    PaginatorModule,
    PriceRangeDisplayComponent,
    PriceRangeDisplayTemplateDirective,
    PriceRangeSliderComponent,
    ProgressSpinnerModule,
  ],
})
export class CatalogBrowsePageComponent implements OnInit {
  protected readonly store = inject(CatalogBrowseStore);

  /** Bound to search input before apply. */
  readonly searchDraft = signal('');

  /** Slider bounds (EUR inclusive). Unbounded filter uses floor/ceil. */
  readonly priceSliderOptions: Options = {
    floor: PRICE_SLIDER_FLOOR,
    ceil: PRICE_SLIDER_CEIL,
    step: 1,
    enforceRange: true,
  };

  readonly priceSliderLow = signal(PRICE_SLIDER_FLOOR);
  readonly priceSliderHigh = signal(PRICE_SLIDER_CEIL);
  readonly priceFilterError = signal<string | null>(null);

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
    this.syncPriceSliderFromStore();
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

  protected onPriceSliderUserChangeEnd(ctx: ChangeContext): void {
    this.priceSliderLow.set(ctx.value);
    this.priceSliderHigh.set(ctx.highValue ?? PRICE_SLIDER_CEIL);
  }

  protected applyPriceFilter(): void {
    this.priceFilterError.set(null);

    const low = this.priceSliderLow();
    const high = this.priceSliderHigh();

    if (low > high) {
      this.priceFilterError.set(
        'Η ελάχιστη τιμή δεν μπορεί να υπερβαίνει τη μέγιστη.'
      );
      return;
    }

    const salePriceMin = low > PRICE_SLIDER_FLOOR ? low : null;
    const salePriceMax = high < PRICE_SLIDER_CEIL ? high : null;

    this.store.setSalePriceRange(salePriceMin, salePriceMax);
  }

  protected clearPriceFilter(): void {
    this.priceFilterError.set(null);
    this.priceSliderLow.set(PRICE_SLIDER_FLOOR);
    this.priceSliderHigh.set(PRICE_SLIDER_CEIL);
    this.store.setSalePriceRange(null, null);
  }

  private syncPriceSliderFromStore(): void {
    const min = this.store.salePriceMin();
    const max = this.store.salePriceMax();
    this.priceSliderLow.set(min ?? PRICE_SLIDER_FLOOR);
    this.priceSliderHigh.set(max ?? PRICE_SLIDER_CEIL);
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
