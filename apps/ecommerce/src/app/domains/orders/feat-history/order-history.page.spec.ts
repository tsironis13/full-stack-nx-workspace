import { signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';

import { ecommerceTranslocoTestingModule } from '../../../core/public-api';
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
        ecommerceTranslocoTestingModule(),
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

  it('names the orders spinner in the active UI Language', () => {
    loadingSig.set(true);

    const fixture = createFixture();
    const transloco = TestBed.inject(TranslocoService);
    const spinner = fixture.nativeElement.querySelector('lib-spinner');

    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute('aria-label')).toBe(
      transloco.translate('orders.loading'),
    );
    expect(transloco.translate('orders.loading', {}, 'el')).toBe(
      'Φόρτωση παραγγελιών…',
    );
    expect(transloco.translate('orders.loading', {}, 'en')).toBe(
      'Loading orders…',
    );
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
    const cta = fixture.debugElement.query(
      By.css('.order-history__review-cta'),
    );

    expect(cta).toBeTruthy();
    expect(cta.nativeElement.textContent).toContain('Γράψε κριτική');
    expect(cta.attributes['href']).toContain('/products/5');
    expect(cta.nativeElement.hasAttribute('libButton')).toBe(true);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/\bgray-/);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/--p-/);
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
    const cta = fixture.debugElement.query(
      By.css('.order-history__review-cta'),
    );

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

  it('retries with a kit CTA and keeps stored Product names without leftover chrome', () => {
    errorSig.set('boom');
    ordersSig.set([buildOrder()]);

    const errorFixture = createFixture();
    const retry = errorFixture.nativeElement.querySelector(
      '.order-history__state--error button',
    ) as HTMLButtonElement;

    expect(retry.hasAttribute('libButton')).toBe(true);
    expect(errorFixture.nativeElement.innerHTML).not.toMatch(/--p-/);

    errorSig.set(null);
    const listFixture = createFixture();
    expect(listFixture.nativeElement.textContent).toContain('Widget A');
    expect(listFixture.nativeElement.innerHTML).not.toMatch(/\bgray-/);
    expect(listFixture.nativeElement.innerHTML).not.toMatch(/--p-/);
  });
});
