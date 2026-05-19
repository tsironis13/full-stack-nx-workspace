import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import type { CatalogCartLineSnapshot } from '../../cart/domain/public-api';
import { CartAclReadAdapter } from '../../cart/application/anti-corruption-layer';
import { emptyCartGuard } from './empty-cart.guard';

@Component({
  selector: 'app-stub',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StubComponent {}

function makeLine(
  overrides: Partial<CatalogCartLineSnapshot> = {},
): CatalogCartLineSnapshot {
  return {
    mainProductItemId: 1,
    productId: 1,
    name: 'Product',
    quantity: 1,
    originalPrice: 10,
    salePrice: null,
    primaryImageUrl: null,
    ...overrides,
  };
}

describe('emptyCartGuard', () => {
  function setup(items: CatalogCartLineSnapshot[]) {
    const itemsSignal = signal(items);

    const mockCartAcl = {
      items: itemsSignal.asReadonly(),
      hasUnavailableItems: computed(() =>
        itemsSignal().some((i) => i.available === false),
      ),
    } as unknown as CartAclReadAdapter;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'checkout',
            component: StubComponent,
            canActivate: [emptyCartGuard],
          },
          {
            path: 'cart',
            component: StubComponent,
          },
        ]),
        { provide: CartAclReadAdapter, useValue: mockCartAcl },
      ],
    });

    return { itemsSignal };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('redirects to /cart when the cart is empty', async () => {
    setup([]);
    const harness = await RouterTestingHarness.create('/checkout');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/cart');
    expect(harness).toBeDefined();
  });

  it('allows navigation to /checkout when all items are available', async () => {
    setup([
      makeLine({ mainProductItemId: 1, available: true }),
      makeLine({ mainProductItemId: 2, available: true }),
    ]);
    const harness = await RouterTestingHarness.create('/checkout');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/checkout');
    expect(harness).toBeDefined();
  });

  it('redirects to /cart when any item is unavailable', async () => {
    setup([
      makeLine({ mainProductItemId: 1, available: true }),
      makeLine({ mainProductItemId: 2, available: false }),
    ]);
    const harness = await RouterTestingHarness.create('/checkout');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/cart');
    expect(harness).toBeDefined();
  });

  it('redirects to /cart when all items are unavailable', async () => {
    setup([
      makeLine({ mainProductItemId: 1, available: false }),
      makeLine({ mainProductItemId: 2, available: false }),
    ]);
    const harness = await RouterTestingHarness.create('/checkout');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/cart');
    expect(harness).toBeDefined();
  });

  it('allows navigation to /checkout for guest items (no available field)', async () => {
    setup([
      makeLine({ mainProductItemId: 1 }),
      makeLine({ mainProductItemId: 2 }),
    ]);
    const harness = await RouterTestingHarness.create('/checkout');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/checkout');
    expect(harness).toBeDefined();
  });
});
