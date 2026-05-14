import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  CheckoutStore,
  checkoutSuccessGuard,
} from '../../application/public-api';
import { CheckoutConfirmationComponent } from './checkout-confirmation.component';
import type {
  ConfirmedOrderItemWire,
  ShippingAddressWire,
} from '../../application/public-api';

@Component({
  selector: 'app-stub-catalog',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StubCatalogComponent {}

const MOCK_ORDER = {
  orderId: 99,
  status: 'confirmed',
  totalAmount: 29.97,
  createdAt: '2026-05-14T10:00:00.000Z',
};

const MOCK_ITEMS: ConfirmedOrderItemWire[] = [
  { name: 'Widget A', quantity: 2, salePrice: 9.99, originalPrice: 14.99 },
  { name: 'Widget B', quantity: 1, salePrice: null, originalPrice: 9.99 },
];

const MOCK_ADDRESS: ShippingAddressWire = {
  fullName: 'John Doe',
  streetAddress: '123 Main St',
  city: 'Athens',
  postalCode: '10000',
  country: 'GR',
  phone: '+30 210 0000000',
};

function createStoreMock(overrides: {
  isSuccess?: boolean;
  confirmedOrder?: {
    orderId: number;
    status: 'confirmed';
    totalAmount: number;
    createdAt: string;
  } | null;
  confirmedItems?: ConfirmedOrderItemWire[] | null;
  confirmedShippingAddress?: ShippingAddressWire | null;
  confirmedGuestEmail?: string | null;
}) {
  return {
    isSuccess: signal(overrides.isSuccess ?? true),
    confirmedOrder: signal(overrides.confirmedOrder ?? MOCK_ORDER),
    confirmedItems: signal(overrides.confirmedItems ?? MOCK_ITEMS),
    confirmedShippingAddress: signal(
      overrides.confirmedShippingAddress ?? MOCK_ADDRESS,
    ),
    confirmedGuestEmail: signal(overrides.confirmedGuestEmail ?? null),
    clearCart: jest.fn(),
  };
}

describe('CheckoutConfirmationComponent', () => {
  async function setup(storeMock: ReturnType<typeof createStoreMock>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'checkout/confirmation',
            canActivate: [checkoutSuccessGuard],
            component: CheckoutConfirmationComponent,
          },
          { path: 'catalog', component: StubCatalogComponent },
        ]),
        { provide: CheckoutStore, useValue: storeMock },
      ],
    });

    const harness = await RouterTestingHarness.create('/checkout/confirmation');
    const router = TestBed.inject(Router);
    return { harness, router };
  }

  describe('direct navigation guard', () => {
    it('redirects to /catalog when store is not in success state', async () => {
      const storeMock = createStoreMock({
        isSuccess: false,
        confirmedOrder: null,
      });
      const { router } = await setup(storeMock);

      expect(router.url).toBe('/catalog');
    });

    it('does not redirect when store is in success state', async () => {
      const storeMock = createStoreMock({ isSuccess: true });
      const { router } = await setup(storeMock);

      expect(router.url).toBe('/checkout/confirmation');
    });
  });

  describe('cart clear on init', () => {
    it('dispatches clearCart on component init when order succeeded', async () => {
      const storeMock = createStoreMock({ isSuccess: true });
      await setup(storeMock);

      expect(storeMock.clearCart).toHaveBeenCalledTimes(1);
    });

    it('does not call clearCart when redirecting (no success state)', async () => {
      const storeMock = createStoreMock({
        isSuccess: false,
        confirmedOrder: null,
      });
      await setup(storeMock);

      expect(storeMock.clearCart).not.toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('renders order reference number', async () => {
      const storeMock = createStoreMock({ isSuccess: true });
      const { harness } = await setup(storeMock);
      harness.detectChanges();

      expect(harness.routeNativeElement?.textContent).toContain('#99');
    });

    it('renders order items with names and quantities', async () => {
      const storeMock = createStoreMock({ isSuccess: true });
      const { harness } = await setup(storeMock);
      harness.detectChanges();

      const text = harness.routeNativeElement?.textContent ?? '';
      expect(text).toContain('Widget A');
      expect(text).toContain('Widget B');
      expect(text).toContain('x2');
    });

    it('renders shipping address', async () => {
      const storeMock = createStoreMock({ isSuccess: true });
      const { harness } = await setup(storeMock);
      harness.detectChanges();

      const text = harness.routeNativeElement?.textContent ?? '';
      expect(text).toContain('John Doe');
      expect(text).toContain('Athens');
    });

    it('shows guest email when confirmedGuestEmail is present', async () => {
      const storeMock = createStoreMock({
        isSuccess: true,
        confirmedGuestEmail: 'guest@example.com',
      });
      const { harness } = await setup(storeMock);
      harness.detectChanges();

      expect(harness.routeNativeElement?.textContent).toContain(
        'guest@example.com',
      );
    });

    it('does not show guest email section when confirmedGuestEmail is null', async () => {
      const storeMock = createStoreMock({
        isSuccess: true,
        confirmedGuestEmail: null,
      });
      const { harness } = await setup(storeMock);
      harness.detectChanges();

      expect(harness.routeNativeElement?.textContent).not.toContain('@');
    });
  });
});
