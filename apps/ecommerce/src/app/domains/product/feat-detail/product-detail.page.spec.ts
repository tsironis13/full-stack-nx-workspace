import { signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import type { ProductReviewsPage } from '../application/public-api';
import { ProductDetailStore } from '../application/public-api';
import { ProductDetailPageComponent } from './product-detail.page';

describe('ProductDetailPageComponent', () => {
  let loadingSig: WritableSignal<boolean>;
  let errorSig: WritableSignal<string | null>;
  let dataSig: WritableSignal<ProductReviewsPage | null>;
  let displayedAverageSig: WritableSignal<string | null>;
  let hasReviewsSig: WritableSignal<boolean>;
  let loadMock: jest.Mock;

  beforeEach(() => {
    loadingSig = signal(false);
    errorSig = signal<string | null>(null);
    dataSig = signal<ProductReviewsPage | null>(null);
    displayedAverageSig = signal<string | null>(null);
    hasReviewsSig = signal(false);
    loadMock = jest.fn();

    TestBed.configureTestingModule({
      imports: [ProductDetailPageComponent],
      providers: [
        {
          provide: ProductDetailStore,
          useValue: {
            loading: loadingSig.asReadonly(),
            error: errorSig.asReadonly(),
            data: dataSig.asReadonly(),
            displayedAverageRating: displayedAverageSig.asReadonly(),
            hasReviews: hasReviewsSig.asReadonly(),
            load: loadMock,
            applyPagination: jest.fn(),
          },
        },
        provideRouter([]),
      ],
    });
  });

  function createFixture(productId = '42') {
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    fixture.componentRef.setInput('id', productId);
    fixture.detectChanges();
    return fixture;
  }

  it('loads reviews for the route product id on init', () => {
    createFixture('42');
    expect(loadMock).toHaveBeenCalledWith(42);
  });

  it('shows empty state when the product has no reviews', () => {
    dataSig.set({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      averageRating: null,
      reviewCount: 0,
    });
    hasReviewsSig.set(false);

    const fixture = createFixture();
    const emptyEl = fixture.debugElement.query(By.css('.product-detail__empty'));
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.nativeElement.textContent).toContain(
      'Δεν υπάρχουν κριτικές ακόμα',
    );
  });

  it('renders review list items including star-only reviews', () => {
    dataSig.set({
      items: [
        {
          id: 1,
          rating: 5,
          title: 'Άριστο',
          body: 'Πολύ καλό',
          authorDisplayName: 'Kate R.',
          createdAt: new Date('2026-01-15T10:00:00.000Z'),
        },
        {
          id: 2,
          rating: 4,
          title: null,
          body: null,
          authorDisplayName: 'Verified buyer',
          createdAt: new Date('2026-01-10T10:00:00.000Z'),
        },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
      averageRating: 4.5,
      reviewCount: 2,
    });
    hasReviewsSig.set(true);
    displayedAverageSig.set('4.5');

    const fixture = createFixture();
    const reviews = fixture.debugElement.queryAll(By.css('.product-detail__review'));
    expect(reviews).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Kate R.');
    expect(fixture.nativeElement.textContent).toContain('Verified buyer');
    expect(fixture.nativeElement.textContent).toContain('4.5★');

    const starOnlyReview = reviews[1];
    expect(
      starOnlyReview.query(By.css('.product-detail__review-body')),
    ).toBeNull();
    expect(
      starOnlyReview
        .query(By.css('.product-detail__review-stars'))
        ?.attributes['aria-label'],
    ).toBe('4 από 5 αστέρια');
  });
});
