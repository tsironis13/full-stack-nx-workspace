import { Component, input, signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';

import { ecommerceTranslocoTestingModule } from '../../../core/public-api';
import type { CatalogListResponse, CatalogSort } from '../application/public-api';
import { CatalogBrowseStore } from '../application/public-api';
import { CatalogPriceBandComponent } from './catalog-price-band/catalog-price-band.component';
import { CatalogProductCardComponent } from './catalog-product-card/catalog-product-card.component';
import { CatalogBrowsePageComponent } from './catalog-browse.page';

@Component({
  selector: 'app-catalog-price-band',
  template: '',
})
class StubPriceBandComponent {
  readonly salePriceMin = input<number | null>(null);
  readonly salePriceMax = input<number | null>(null);
}

@Component({
  selector: 'app-catalog-product-card',
  template: '',
})
class StubProductCardComponent {
  readonly item = input.required<{ productId: number }>();
}

describe('CatalogBrowsePageComponent', () => {
  let loadingSig: WritableSignal<boolean>;
  let errorSig: WritableSignal<string | null>;
  let dataSig: WritableSignal<CatalogListResponse | null>;
  let setPageMock: jest.Mock;
  let setPageSizeMock: jest.Mock;
  let loadMock: jest.Mock;

  beforeEach(() => {
    loadingSig = signal(false);
    errorSig = signal<string | null>(null);
    dataSig = signal<CatalogListResponse | null>(null);
    setPageMock = jest.fn();
    setPageSizeMock = jest.fn();
    loadMock = jest.fn();

    TestBed.configureTestingModule({
      imports: [CatalogBrowsePageComponent],
      providers: [
        ecommerceTranslocoTestingModule(),
        {
          provide: CatalogBrowseStore,
          useValue: {
            categoryRoots: signal([]).asReadonly(),
            categoryRootsLoading: signal(false).asReadonly(),
            categoryRootsError: signal<string | null>(null).asReadonly(),
            selectedCategoryRootId: signal<number | null>(null).asReadonly(),
            sort: signal<CatalogSort>('newest').asReadonly(),
            salePriceMin: signal<number | null>(null).asReadonly(),
            salePriceMax: signal<number | null>(null).asReadonly(),
            minRating: signal<number | null>(null).asReadonly(),
            facets: signal([]).asReadonly(),
            selectedAttributeFilters: signal({}).asReadonly(),
            loading: loadingSig.asReadonly(),
            error: errorSig.asReadonly(),
            data: dataSig.asReadonly(),
            pageSize: signal(12).asReadonly(),
            load: loadMock,
            loadCategoryRoots: jest.fn(),
            setSearchQuery: jest.fn(),
            setSort: jest.fn(),
            setPage: setPageMock,
            setPageSize: setPageSizeMock,
            setCategoryRoot: jest.fn(),
            setSalePriceRange: jest.fn(),
            setMinRating: jest.fn(),
            setAttributeFilter: jest.fn(),
            clearAttributeFilters: jest.fn(),
          },
        },
      ],
    }).overrideComponent(CatalogBrowsePageComponent, {
      remove: {
        imports: [CatalogPriceBandComponent, CatalogProductCardComponent],
      },
      add: { imports: [StubPriceBandComponent, StubProductCardComponent] },
    });
  });

  function createFixture() {
    const fixture = TestBed.createComponent(CatalogBrowsePageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('names the catalog spinner in the active UI Language', () => {
    loadingSig.set(true);

    const fixture = createFixture();
    const transloco = TestBed.inject(TranslocoService);
    const spinner = fixture.nativeElement.querySelector('lib-spinner');

    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute('aria-label')).toBe(
      transloco.translate('catalog.loading'),
    );
    expect(transloco.translate('catalog.loading', {}, 'el')).toBe(
      'Φόρτωση καταλόγου…',
    );
    expect(transloco.translate('catalog.loading', {}, 'en')).toBe(
      'Loading catalog…',
    );
  });

  it('pages the catalog from store page and pageSize, not PrimeNG PaginatorState', () => {
    dataSig.set({
      items: [
        {
          productId: 1,
          name: 'Shirt',
          mainProductItemId: 10,
          salePrice: null,
          originalPrice: null,
          primaryImageUrl: null,
          additionalOptionsCount: 0,
          averageRating: null,
          reviewCount: 0,
        },
      ],
      total: 48,
      page: 2,
      pageSize: 12,
      facets: [],
    });

    const fixture = createFixture();
    const paginator = fixture.debugElement.query(By.css('lib-paginator'));

    expect(paginator).toBeTruthy();
    expect(paginator.componentInstance.page()).toBe(2);
    expect(paginator.componentInstance.pageSize()).toBe(12);
    expect(paginator.componentInstance.total()).toBe(48);

    paginator.triggerEventHandler('pageChange', { page: 3, pageSize: 12 });
    fixture.detectChanges();

    expect(setPageMock).toHaveBeenCalledWith(3);
    expect(setPageSizeMock).toHaveBeenCalledWith(12);
    expect(loadMock).toHaveBeenCalled();
  });
});
