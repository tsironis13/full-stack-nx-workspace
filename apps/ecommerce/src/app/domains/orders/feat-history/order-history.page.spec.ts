import { signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import type { OrderHistoryOrder } from '../application/public-api';
import { OrderHistoryStore } from '../application/public-api';
import { OrderHistoryPageComponent } from './order-history.page';

describe('OrderHistoryPageComponent', () => {
  let loadingSig: WritableSignal<boolean>;
  let errorSig: WritableSignal<string | null>;
  let ordersSig: WritableSignal<OrderHistoryOrder[]>;
  let isEmptySig: WritableSignal<boolean>;
  let loadMock: jest.Mock;

  beforeEach(() => {
    loadingSig = signal(false);
    errorSig = signal<string | null>(null);
    ordersSig = signal<OrderHistoryOrder[]>([]);
    isEmptySig = signal(false);
    loadMock = jest.fn();

    TestBed.configureTestingModule({
      imports: [OrderHistoryPageComponent],
      providers: [
        {
          provide: OrderHistoryStore,
          useValue: {
            loading: loadingSig.asReadonly(),
            error: errorSig.asReadonly(),
            orders: ordersSig.asReadonly(),
            isEmpty: isEmptySig.asReadonly(),
            load: loadMock,
          },
        },
        provideRouter([]),
      ],
    });
  });

  function createFixture() {
    const fixture = TestBed.createComponent(OrderHistoryPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  function buildOrder(
    overrides: Partial<OrderHistoryOrder> = {},
  ): OrderHistoryOrder {
    return {
      orderId: 100,
      status: 'confirmed',
      totalAmount: 49.9,
      createdAt: new Date('2026-05-13T10:00:00.000Z'),
      items: [
        {
          productItemId: 10,
          productId: 5,
          productName: 'Widget A',
          productCode: 'SKU-A',
          salePrice: 20,
          quantity: 1,
          canReview: true,
          hasReview: false,
          reviewId: null,
        },
      ],
      ...overrides,
    };
  }

  it('loads order history on init', () => {
    createFixture();
    expect(loadMock).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when there are no orders', () => {
    isEmptySig.set(true);

    const fixture = createFixture();

    expect(
      fixture.debugElement.query(By.css('.order-history__empty')),
    ).toBeTruthy();
  });

  it('shows a "Write a review" CTA linking to the product page when no review exists', () => {
    ordersSig.set([buildOrder()]);

    const fixture = createFixture();
    const cta = fixture.debugElement.query(By.css('.order-history__review-cta'));

    expect(cta).toBeTruthy();
    expect(cta.nativeElement.textContent).toContain('Γράψε κριτική');
    expect(cta.attributes['href']).toContain('/products/5');
  });

  it('shows an "Edit review" CTA when a review already exists', () => {
    ordersSig.set([
      buildOrder({
        items: [
          {
            productItemId: 10,
            productId: 5,
            productName: 'Widget A',
            productCode: 'SKU-A',
            salePrice: 20,
            quantity: 1,
            canReview: true,
            hasReview: true,
            reviewId: 77,
          },
        ],
      }),
    ]);

    const fixture = createFixture();
    const cta = fixture.debugElement.query(By.css('.order-history__review-cta'));

    expect(cta.nativeElement.textContent).toContain('Επεξεργασία κριτικής');
  });

  it('hides the review CTA when the line is not eligible', () => {
    ordersSig.set([
      buildOrder({
        items: [
          {
            productItemId: 10,
            productId: 5,
            productName: 'Widget A',
            productCode: 'SKU-A',
            salePrice: 20,
            quantity: 1,
            canReview: false,
            hasReview: false,
            reviewId: null,
          },
        ],
      }),
    ]);

    const fixture = createFixture();

    expect(
      fixture.debugElement.query(By.css('.order-history__review-cta')),
    ).toBeNull();
  });
});
