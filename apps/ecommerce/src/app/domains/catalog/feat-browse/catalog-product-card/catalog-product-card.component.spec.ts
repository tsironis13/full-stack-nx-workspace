import { computed, signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { provideDispatcher } from '@ngrx/signals/events';

import { CartAclReadAdapter } from '../../application/public-api';
import type { CatalogListItem } from '../../application/public-api';
import { CatalogProductCardComponent } from './catalog-product-card.component';

describe('CatalogProductCardComponent', () => {
  let pendingSig: WritableSignal<number | null>;

  beforeEach(() => {
    pendingSig = signal(null);

    TestBed.configureTestingModule({
      imports: [CatalogProductCardComponent],
      providers: [
        ...provideDispatcher(),
        {
          provide: CartAclReadAdapter,
          useValue: {
            itemQuantities: computed(() => new Map<number, number>()),
            pendingMainProductItemId: pendingSig.asReadonly(),
          },
        },
        provideRouter([]),
      ],
    });
  });

  function createFixture(item: CatalogListItem) {
    const fixture = TestBed.createComponent(CatalogProductCardComponent);
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();
    return fixture;
  }

  /** `salePrice` left null so CurrencyPipe is not exercised (el-GR locale). */
  const baseItem: CatalogListItem = {
    productId: 1,
    name: 'Test Shirt',
    mainProductItemId: 10,
    salePrice: null,
    originalPrice: null,
    primaryImageUrl: null,
    additionalOptionsCount: 0,
    averageRating: null,
    reviewCount: 0,
  };

  it('shows rounded average stars and count when the product has reviews', () => {
    const fixture = createFixture({
      ...baseItem,
      averageRating: 4.6666667,
      reviewCount: 3,
    });

    const ratingEl = fixture.debugElement.query(By.css('.catalog-card__rating'));
    expect(ratingEl).toBeTruthy();
    expect(ratingEl.nativeElement.textContent).toContain('4.7★');
    expect(ratingEl.nativeElement.textContent).toContain('(3)');
    expect(ratingEl.attributes['aria-label']).toBe(
      'Μέση βαθμολογία 4.7 από 5, 3 κριτικές',
    );
  });

  it('hides the star score when the product has no reviews', () => {
    const fixture = createFixture(baseItem);

    const ratingEl = fixture.debugElement.query(By.css('.catalog-card__rating'));
    expect(ratingEl).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('★');
  });
});
