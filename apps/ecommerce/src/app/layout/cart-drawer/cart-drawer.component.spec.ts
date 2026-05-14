import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dispatcher } from '@ngrx/signals/events';

import { LocalStorageFacade } from '../../core/public-api';
import {
  CartAclReadAdapter,
  cartCatalogEvents,
  cartUiEvents,
} from '../../domains/cart/application/anti-corruption-layer';
import { CartDrawerComponent } from './cart-drawer.component';

function addItem(
  dispatcher: Dispatcher,
  mainProductItemId: number,
  name = 'Test',
  salePrice = 5,
): void {
  dispatcher.dispatch(
    cartCatalogEvents.addFromBrowse({
      productId: mainProductItemId,
      mainProductItemId,
      name,
      salePrice,
      originalPrice: null,
      primaryImageUrl: null,
    }),
  );
}

describe('CartDrawerComponent', () => {
  let dispatcher: Dispatcher;
  let cartRead: CartAclReadAdapter;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [CartDrawerComponent],
      providers: [
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideRouter([]),
      ],
    });
    // Initialize CartAclReadAdapter (and GuestCartStore) before dispatching events
    cartRead = TestBed.inject(CartAclReadAdapter);
    dispatcher = TestBed.inject(Dispatcher);
  });

  afterEach(() => localStorage.clear());

  function createFixture(visible = true) {
    const fixture = TestBed.createComponent(CartDrawerComponent);
    fixture.componentRef.setInput('visible', visible);
    fixture.detectChanges();
    return fixture;
  }

  it('reads 0 items when cart is empty', () => {
    expect(cartRead.items()).toHaveLength(0);
    expect(cartRead.totalUnitCount()).toBe(0);
  });

  it('reflects added items via ACL read adapter', () => {
    addItem(dispatcher, 20, 'Drawer Product', 15);

    expect(cartRead.items()).toHaveLength(1);
    expect(cartRead.items()[0].name).toBe('Drawer Product');
  });

  it('computes cartSubtotal from ACL adapter', () => {
    addItem(dispatcher, 10, 'A', 5);
    addItem(dispatcher, 10, 'A', 5);

    // 5 × 2 = 10
    expect(cartRead.cartSubtotal()).toBe(10);
  });

  it('dispatches incrementItem when onIncrement is called', () => {
    addItem(dispatcher, 5);

    const fixture = createFixture();
    jest.spyOn(dispatcher, 'dispatch');

    (
      fixture.componentInstance as unknown as { onIncrement(id: number): void }
    ).onIncrement(5);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      cartUiEvents.incrementItem({ mainProductItemId: 5 }),
      { scope: 'self' },
    );
  });

  it('dispatches decrementOrRemoveItem when onDecrement is called', () => {
    addItem(dispatcher, 5);
    addItem(dispatcher, 5);

    const fixture = createFixture();
    jest.spyOn(dispatcher, 'dispatch');

    (
      fixture.componentInstance as unknown as { onDecrement(id: number): void }
    ).onDecrement(5);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      cartUiEvents.decrementOrRemoveItem({ mainProductItemId: 5 }),
      { scope: 'self' },
    );
  });

  it('dispatches removeItem when onRemove is called', () => {
    addItem(dispatcher, 7);

    const fixture = createFixture();
    jest.spyOn(dispatcher, 'dispatch');

    (
      fixture.componentInstance as unknown as { onRemove(id: number): void }
    ).onRemove(7);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      cartUiEvents.removeItem({ mainProductItemId: 7 }),
      { scope: 'self' },
    );
  });

  it('decrementOrRemoveItem at qty 1 removes the item from ACL', () => {
    addItem(dispatcher, 3);

    dispatcher.dispatch(
      cartUiEvents.decrementOrRemoveItem({ mainProductItemId: 3 }),
    );

    expect(cartRead.items()).toHaveLength(0);
    expect(cartRead.cartSubtotal()).toBe(0);
  });

  it('removeItem removes from ACL regardless of quantity', () => {
    addItem(dispatcher, 9, 'Z', 10);
    addItem(dispatcher, 9, 'Z', 10);

    dispatcher.dispatch(cartUiEvents.removeItem({ mainProductItemId: 9 }));

    expect(cartRead.items()).toHaveLength(0);
  });
});
