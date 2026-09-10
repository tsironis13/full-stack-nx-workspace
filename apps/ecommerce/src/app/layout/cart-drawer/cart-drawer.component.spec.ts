import { computed, signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dispatcher, provideDispatcher } from '@ngrx/signals/events';

import {
  CartAclReadAdapter,
  cartUiEvents,
} from '../../domains/cart/application/anti-corruption-layer';
import { ecommerceTranslocoTestingModule } from '../../core/public-api';

import { CartDrawerComponent } from './cart-drawer.component';

/** Fixture shape aligned with cart line snapshots (layout specs do not import domain barrels). */
interface CartDrawerLineFixture {
  quantity: number;
  productId: number;
  mainProductItemId: number;
  name: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
  available?: boolean;
}

describe('CartDrawerComponent', () => {
  let itemsSig: WritableSignal<CartDrawerLineFixture[]>;

  beforeEach(() => {
    itemsSig = signal([]);

    const cartSubtotal = computed(() =>
      itemsSig().reduce(
        (sum, l) => sum + (l.salePrice ?? l.originalPrice ?? 0) * l.quantity,
        0,
      ),
    );
    const totalUnitCount = computed(() =>
      itemsSig().reduce((sum, l) => sum + l.quantity, 0),
    );

    TestBed.configureTestingModule({
      imports: [CartDrawerComponent],
      providers: [
        ecommerceTranslocoTestingModule(),
        ...provideDispatcher(),
        {
          provide: CartAclReadAdapter,
          useValue: {
            items: () => itemsSig(),
            totalUnitCount,
            itemQuantities: computed(() => new Map<number, number>()),
            cartSubtotal,
            pendingMainProductItemId: signal<number | null>(null).asReadonly(),
          },
        },
        provideRouter([]),
      ],
    });
  });

  function createFixture(visible = true) {
    const fixture = TestBed.createComponent(CartDrawerComponent);
    fixture.componentRef.setInput('visible', visible);
    fixture.detectChanges();
    return fixture;
  }

  function formatEur(amount: number): string {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  it('shows empty message when ACL reports no lines', () => {
    const fixture = createFixture();

    expect(
      fixture.nativeElement.querySelector('.cart-drawer__empty'),
    ).toBeTruthy();
  });

  it('renders line details from ACL adapter', () => {
    itemsSig.set([
      {
        quantity: 1,
        productId: 1,
        mainProductItemId: 20,
        name: 'Drawer Product',
        salePrice: 15,
        originalPrice: null,
        primaryImageUrl: null,
      },
    ]);

    const fixture = createFixture();

    expect(fixture.nativeElement.textContent).toContain('Drawer Product');
    expect(fixture.nativeElement.textContent).toContain(formatEur(15));
  });

  it('shows formatted cart subtotal from ACL adapter', () => {
    itemsSig.set([
      {
        quantity: 2,
        productId: 1,
        mainProductItemId: 10,
        name: 'A',
        salePrice: 5,
        originalPrice: null,
        primaryImageUrl: null,
      },
    ]);

    const fixture = createFixture();

    expect(fixture.nativeElement.textContent).toContain(formatEur(10));
  });

  it('dispatches incrementItem when onIncrement is called', () => {
    const fixture = createFixture();
    const dispatcher = TestBed.inject(Dispatcher);
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
    const fixture = createFixture();
    const dispatcher = TestBed.inject(Dispatcher);
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
    const fixture = createFixture();
    const dispatcher = TestBed.inject(Dispatcher);
    jest.spyOn(dispatcher, 'dispatch');

    (
      fixture.componentInstance as unknown as { onRemove(id: number): void }
    ).onRemove(7);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      cartUiEvents.removeItem({ mainProductItemId: 7 }),
      { scope: 'self' },
    );
  });

  it('keeps stored Product names, a kit view-cart CTA, and a danger remove without leftover chrome', () => {
    itemsSig.set([
      {
        quantity: 1,
        productId: 1,
        mainProductItemId: 20,
        name: 'Stored Drawer Shirt',
        salePrice: 15,
        originalPrice: null,
        primaryImageUrl: 'https://cdn.example/drawer.jpg',
      },
    ]);

    const fixture = createFixture();
    const img = fixture.nativeElement.querySelector(
      'img',
    ) as HTMLImageElement;
    const viewCart = fixture.nativeElement.querySelector(
      '.cart-drawer__footer button',
    ) as HTMLButtonElement;
    const remove = fixture.nativeElement.querySelector(
      '.cart-drawer__item-controls button[variant="danger"]',
    ) as HTMLButtonElement;

    expect(fixture.nativeElement.textContent).toContain('Stored Drawer Shirt');
    expect(img.src).toContain('https://cdn.example/drawer.jpg');
    expect(viewCart.hasAttribute('libButton')).toBe(true);
    expect(remove.hasAttribute('libButton')).toBe(true);
    expect(remove.getAttribute('variant')).toBe('danger');
    expect(remove.classList.contains('hover:bg-red-800')).toBe(true);
    expect(remove.classList.contains('hover:bg-primary-hover')).toBe(false);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/\bgray-/);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/--p-/);
  });
});
