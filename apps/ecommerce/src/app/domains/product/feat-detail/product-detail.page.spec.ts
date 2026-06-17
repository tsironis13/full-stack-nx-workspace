import { signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { AuthStore } from '@full-stack-nx-workspace/auth-web';

import type { MyReview, ProductReviewsPage } from '../application/public-api';
import {
  ProductDetailStore,
  ReviewSubmissionStore,
} from '../application/public-api';
import { ProductDetailPageComponent } from './product-detail.page';

describe('ProductDetailPageComponent', () => {
  let loadingSig: WritableSignal<boolean>;
  let errorSig: WritableSignal<string | null>;
  let dataSig: WritableSignal<ProductReviewsPage | null>;
  let displayedAverageSig: WritableSignal<string | null>;
  let hasReviewsSig: WritableSignal<boolean>;
  let loadMock: jest.Mock;

  let isAuthenticatedSig: WritableSignal<boolean>;
  let myReviewSig: WritableSignal<MyReview | null>;
  let notEligibleSig: WritableSignal<boolean>;
  let savingSig: WritableSignal<boolean>;
  let submissionErrorSig: WritableSignal<string | null>;
  let submitMock: jest.Mock;
  let editMock: jest.Mock;
  let removeMock: jest.Mock;
  let loadMineMock: jest.Mock;

  beforeEach(() => {
    loadingSig = signal(false);
    errorSig = signal<string | null>(null);
    dataSig = signal<ProductReviewsPage | null>(null);
    displayedAverageSig = signal<string | null>(null);
    hasReviewsSig = signal(false);
    loadMock = jest.fn();

    isAuthenticatedSig = signal(false);
    myReviewSig = signal<MyReview | null>(null);
    notEligibleSig = signal(false);
    savingSig = signal(false);
    submissionErrorSig = signal<string | null>(null);
    submitMock = jest.fn();
    editMock = jest.fn();
    removeMock = jest.fn();
    loadMineMock = jest.fn();

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
        {
          provide: ReviewSubmissionStore,
          useValue: {
            myReview: myReviewSig.asReadonly(),
            notEligible: notEligibleSig.asReadonly(),
            saving: savingSig.asReadonly(),
            error: submissionErrorSig.asReadonly(),
            load: loadMineMock,
            submit: submitMock,
            edit: editMock,
            remove: removeMock,
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: isAuthenticatedSig.asReadonly(),
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

  describe('review writing', () => {
    it('gates guests behind a sign-in prompt and hides the form', () => {
      isAuthenticatedSig.set(false);

      const fixture = createFixture();

      expect(loadMineMock).not.toHaveBeenCalled();
      expect(
        fixture.debugElement.query(By.css('.product-detail__gate')),
      ).toBeTruthy();
      expect(
        fixture.debugElement.query(By.css('.product-detail__form')),
      ).toBeNull();
    });

    it('loads the current user review when authenticated', () => {
      isAuthenticatedSig.set(true);

      createFixture('42');

      expect(loadMineMock).toHaveBeenCalledWith(42);
    });

    it('shows "cannot review" messaging for non-verified users', () => {
      isAuthenticatedSig.set(true);
      notEligibleSig.set(true);

      const fixture = createFixture();

      expect(
        fixture.debugElement.query(By.css('.product-detail__gate'))
          ?.nativeElement.textContent,
      ).toContain('Μόνο όσοι έχουν αγοράσει');
      expect(
        fixture.debugElement.query(By.css('.product-detail__form')),
      ).toBeNull();
    });

    it('blocks submit and shows a validation error when no stars are selected', () => {
      isAuthenticatedSig.set(true);

      const fixture = createFixture();
      const form = fixture.debugElement.query(By.css('.product-detail__form'));
      form.triggerEventHandler('ngSubmit', {});
      fixture.detectChanges();

      expect(submitMock).not.toHaveBeenCalled();
      expect(
        fixture.debugElement.query(By.css('.product-detail__field-error')),
      ).toBeTruthy();
    });

    it('submits a valid review draft', () => {
      isAuthenticatedSig.set(true);

      const fixture = createFixture();
      const component = fixture.componentInstance as unknown as {
        selectRating: (n: number) => void;
        submitReview: () => void;
      };
      component.selectRating(5);
      component.submitReview();

      expect(submitMock).toHaveBeenCalledWith(
        expect.objectContaining({ rating: 5 }),
      );
    });

    it('renders edit/delete controls when the user already has a review', () => {
      isAuthenticatedSig.set(true);
      myReviewSig.set({
        id: 1,
        productId: 42,
        rating: 4,
        title: 'Καλό',
        body: null,
        authorDisplayName: 'Kate R.',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      const fixture = createFixture();

      const actions = fixture.debugElement.query(
        By.css('.product-detail__my-review-actions'),
      );
      expect(actions).toBeTruthy();
      expect(
        fixture.debugElement.query(By.css('.product-detail__form')),
      ).toBeNull();
    });
  });
});
