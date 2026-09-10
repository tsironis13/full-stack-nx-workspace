import { signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Dispatcher, provideDispatcher } from '@ngrx/signals/events';

import { ecommerceTranslocoTestingModule } from '../../../core/public-api';
import { CartStore, cartUiEvents } from '../application/public-api';
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
  available?: boolean;
  priceChanged?: boolean;
}

describe('CartPageComponent', () => {
  let itemsSig: WritableSignal<CartPageLineFixture[]>;
  let pendingSig: WritableSignal<number | null>;

  beforeEach(() => {
    itemsSig = signal([]);
    pendingSig = signal(null);

    TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        ecommerceTranslocoTestingModule(),
        ...provideDispatcher(),
        {
          provide: CartStore,
          useValue: {
            items: itemsSig.asReadonly(),
            pendingMainProductItemId: pendingSig.asReadonly(),
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

  it('dispatches incrementItem when addItemToCart fires', () => {
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
    const dispatcher = TestBed.inject(Dispatcher);
    jest.spyOn(dispatcher, 'dispatch');
    const control = fixture.debugElement.query(
      By.css('app-cart-quantity-control'),
    );
    control.triggerEventHandler('addItemToCart', null);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      cartUiEvents.incrementItem({ mainProductItemId: 7 }),
      { scope: 'self' },
    );
  });

  it('dispatches decrementOrRemoveItem when removeItemFromCart fires', () => {
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
    const dispatcher = TestBed.inject(Dispatcher);
    jest.spyOn(dispatcher, 'dispatch');
    const control = fixture.debugElement.query(
      By.css('app-cart-quantity-control'),
    );
    control.triggerEventHandler('removeItemFromCart', null);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      cartUiEvents.decrementOrRemoveItem({ mainProductItemId: 7 }),
      { scope: 'self' },
    );
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

  it('keeps stored Product names, kit CTAs, and a danger remove without leftover chrome', () => {
    itemsSig.set([
      {
        productId: 1,
        mainProductItemId: 10,
        name: 'Stored Cart Shirt',
        salePrice: 12,
        originalPrice: 12,
        primaryImageUrl: 'https://cdn.example/shirt.jpg',
        quantity: 1,
      },
    ]);

    const fixture = createFixture();
    const img = fixture.nativeElement.querySelector(
      'img',
    ) as HTMLImageElement;
    const checkout = fixture.nativeElement.querySelector(
      '.cart-page__actions button',
    ) as HTMLButtonElement;
    const remove = fixture.nativeElement.querySelector(
      '.cart-item__controls button[variant="danger"]',
    ) as HTMLButtonElement;

    expect(fixture.nativeElement.textContent).toContain('Stored Cart Shirt');
    expect(img.src).toContain('https://cdn.example/shirt.jpg');
    expect(checkout.hasAttribute('libButton')).toBe(true);
    expect(checkout.getAttribute('variant')).not.toBe('danger');
    expect(remove).toBeTruthy();
    expect(remove.hasAttribute('libButton')).toBe(true);
    expect(remove.classList.contains('bg-red-700')).toBe(true);
    expect(remove.classList.contains('hover:bg-red-800')).toBe(true);
    expect(remove.classList.contains('hover:bg-primary-hover')).toBe(false);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/\bgray-/);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/--p-/);
  });

  it('keeps unavailable-line remove as a danger kit CTA', () => {
    itemsSig.set([
      {
        productId: 1,
        mainProductItemId: 10,
        name: 'Gone Shirt',
        salePrice: 12,
        originalPrice: 12,
        primaryImageUrl: null,
        quantity: 1,
        available: false,
      },
    ]);

    const fixture = createFixture();
    const remove = fixture.nativeElement.querySelector(
      'app-cart-unavailable-line-alert button',
    ) as HTMLButtonElement;

    expect(remove.hasAttribute('libButton')).toBe(true);
    expect(remove.getAttribute('variant')).toBe('danger');
    expect(remove.classList.contains('hover:bg-primary-hover')).toBe(false);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/--p-/);
  });
});
