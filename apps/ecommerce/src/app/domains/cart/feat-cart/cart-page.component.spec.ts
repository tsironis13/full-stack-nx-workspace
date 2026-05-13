import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { LocalStorageFacade } from '../../../core/public-api';
import { GuestCartStore } from '../application/public-api';
import { CartPageComponent } from './cart-page.component';

describe('CartPageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        GuestCartStore,
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideRouter([]),
      ],
    });
  });

  afterEach(() => localStorage.clear());

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
    const store = TestBed.inject(GuestCartStore);
    store.addFromBrowseRow(
      {
        productId: 1,
        mainProductItemId: 10,
        name: 'Test Product',
        salePrice: 9.99,
        originalPrice: 14.99,
        primaryImageUrl: null,
      },
      2
    );

    const fixture = createFixture();
    const itemsList = fixture.debugElement.query(By.css('.cart-page__items'));
    expect(itemsList).toBeTruthy();
    const items = fixture.debugElement.queryAll(By.css('.cart-item'));
    expect(items).toHaveLength(1);
  });

  it('does not show empty state when cart has items', () => {
    const store = TestBed.inject(GuestCartStore);
    store.addFromBrowseRow(
      { productId: 1, mainProductItemId: 10, name: 'A', salePrice: 5, originalPrice: null, primaryImageUrl: null },
      1
    );

    const fixture = createFixture();
    const emptyEl = fixture.debugElement.query(By.css('.cart-page__empty'));
    expect(emptyEl).toBeNull();
  });

  it('displays line name and subtotal', () => {
    const store = TestBed.inject(GuestCartStore);
    store.addFromBrowseRow(
      { productId: 1, mainProductItemId: 10, name: 'Alpha', salePrice: 10, originalPrice: null, primaryImageUrl: null },
      3
    );

    const fixture = createFixture();
    const itemEl = fixture.debugElement.query(By.css('.cart-item'));
    expect(itemEl.nativeElement.textContent).toContain('Alpha');
    // 10 × 3 = 30 EUR in el-GR format
    const subtotalEl = fixture.debugElement.query(By.css('.cart-item__subtotal'));
    expect(subtotalEl.nativeElement.textContent).toContain('30');
  });

  it('calls store.incrementLine when addItemToCart fires', () => {
    const store = TestBed.inject(GuestCartStore);
    store.addFromBrowseRow(
      { productId: 1, mainProductItemId: 7, name: 'B', salePrice: 5, originalPrice: null, primaryImageUrl: null },
      1
    );
    jest.spyOn(store, 'incrementLine');

    const fixture = createFixture();
    const control = fixture.debugElement.query(By.css('app-cart-quantity-control'));
    control.triggerEventHandler('addItemToCart', null);

    expect(store.incrementLine).toHaveBeenCalledWith(7);
  });

  it('calls store.decrementLine when removeItemFromCart fires', () => {
    const store = TestBed.inject(GuestCartStore);
    store.addFromBrowseRow(
      { productId: 1, mainProductItemId: 7, name: 'B', salePrice: 5, originalPrice: null, primaryImageUrl: null },
      2
    );
    jest.spyOn(store, 'decrementLine');

    const fixture = createFixture();
    const control = fixture.debugElement.query(By.css('app-cart-quantity-control'));
    control.triggerEventHandler('removeItemFromCart', null);

    expect(store.decrementLine).toHaveBeenCalledWith(7);
  });

  it('shows cart subtotal', () => {
    const store = TestBed.inject(GuestCartStore);
    store.addFromBrowseRow(
      { productId: 1, mainProductItemId: 1, name: 'X', salePrice: 5, originalPrice: null, primaryImageUrl: null },
      2
    );
    store.addFromBrowseRow(
      { productId: 2, mainProductItemId: 2, name: 'Y', salePrice: 3, originalPrice: null, primaryImageUrl: null },
      1
    );

    const fixture = createFixture();
    const totalEl = fixture.debugElement.query(By.css('.cart-page__total'));
    // 5×2 + 3×1 = 13
    expect(totalEl.nativeElement.textContent).toContain('13');
  });
});
