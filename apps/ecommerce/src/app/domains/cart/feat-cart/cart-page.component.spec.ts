import { signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { CartStore } from '../application/public-api';
import { CartPageComponent } from './cart-page.component';

/** Snapshot fields the cart page template reads (keeps specs free of domain barrels). */
interface CartPageLineFixture {
  quantity: number;
  productId: number;
  mainProductItemId: number;
  name: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
}

describe('CartPageComponent', () => {
  let itemsSig: WritableSignal<CartPageLineFixture[]>;
  let pendingSig: WritableSignal<number | null>;
  let incrementLine: jest.Mock;
  let decrementLine: jest.Mock;
  let removeLine: jest.Mock;

  beforeEach(() => {
    itemsSig = signal([]);
    pendingSig = signal(null);
    incrementLine = jest.fn();
    decrementLine = jest.fn();
    removeLine = jest.fn();

    TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        {
          provide: CartStore,
          useValue: {
            items: itemsSig.asReadonly(),
            pendingMainProductItemId: pendingSig.asReadonly(),
            incrementLine,
            decrementLine,
            removeLine,
          },
        },
        provideRouter([]),
      ],
    });
  });

  function createFixture() {
    const fixture = TestBed.createComponent(CartPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows empty state when cart has no items', () => {
    const fixture = createFixture();
    const emptyEl = fixture.debugElement.query(By.css('.cart-page__empty'));
    expect(emptyEl).toBeTruthy();
    const itemsList = fixture.debugElement.query(By.css('.cart-page__items'));
    expect(itemsList).toBeNull();
  });

  it('shows items list when cart has items', () => {
    itemsSig.set([
      {
        productId: 1,
        mainProductItemId: 10,
        name: 'Test Product',
        salePrice: 9.99,
        originalPrice: 14.99,
        primaryImageUrl: null,
        quantity: 2,
      },
    ]);

    const fixture = createFixture();
    const itemsList = fixture.debugElement.query(By.css('.cart-page__items'));
    expect(itemsList).toBeTruthy();
    const items = fixture.debugElement.queryAll(By.css('.cart-item'));
    expect(items).toHaveLength(1);
  });

  it('does not show empty state when cart has items', () => {
    itemsSig.set([
      {
        productId: 1,
        mainProductItemId: 10,
        name: 'A',
        salePrice: 5,
        originalPrice: null,
        primaryImageUrl: null,
        quantity: 1,
      },
    ]);

    const fixture = createFixture();
    const emptyEl = fixture.debugElement.query(By.css('.cart-page__empty'));
    expect(emptyEl).toBeNull();
  });

  it('displays line name and subtotal', () => {
    itemsSig.set([
      {
        productId: 1,
        mainProductItemId: 10,
        name: 'Alpha',
        salePrice: 10,
        originalPrice: null,
        primaryImageUrl: null,
        quantity: 3,
      },
    ]);

    const fixture = createFixture();
    const itemEl = fixture.debugElement.query(By.css('.cart-item'));
    expect(itemEl.nativeElement.textContent).toContain('Alpha');
    const subtotalEl = fixture.debugElement.query(
      By.css('.cart-item__subtotal'),
    );
    expect(subtotalEl.nativeElement.textContent).toContain('30');
  });

  it('calls store.incrementLine when addItemToCart fires', () => {
    itemsSig.set([
      {
        productId: 1,
        mainProductItemId: 7,
        name: 'B',
        salePrice: 5,
        originalPrice: null,
        primaryImageUrl: null,
        quantity: 1,
      },
    ]);

    const fixture = createFixture();
    const control = fixture.debugElement.query(
      By.css('app-cart-quantity-control'),
    );
    control.triggerEventHandler('addItemToCart', null);

    expect(incrementLine).toHaveBeenCalledWith(7);
  });

  it('calls store.decrementLine when removeItemFromCart fires', () => {
    itemsSig.set([
      {
        productId: 1,
        mainProductItemId: 7,
        name: 'B',
        salePrice: 5,
        originalPrice: null,
        primaryImageUrl: null,
        quantity: 2,
      },
    ]);

    const fixture = createFixture();
    const control = fixture.debugElement.query(
      By.css('app-cart-quantity-control'),
    );
    control.triggerEventHandler('removeItemFromCart', null);

    expect(decrementLine).toHaveBeenCalledWith(7);
  });

  it('shows cart subtotal', () => {
    itemsSig.set([
      {
        productId: 1,
        mainProductItemId: 1,
        name: 'X',
        salePrice: 5,
        originalPrice: null,
        primaryImageUrl: null,
        quantity: 2,
      },
      {
        productId: 2,
        mainProductItemId: 2,
        name: 'Y',
        salePrice: 3,
        originalPrice: null,
        primaryImageUrl: null,
        quantity: 1,
      },
    ]);

    const fixture = createFixture();
    const totalEl = fixture.debugElement.query(By.css('.cart-page__total'));
    expect(totalEl.nativeElement.textContent).toContain('13');
  });
});
