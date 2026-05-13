import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { CartAclReadAdapter } from '../../cart/application/anti-corruption-layer';
import { emptyCartGuard } from './empty-cart.guard';

@Component({
  selector: 'app-stub',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StubComponent {}

describe('emptyCartGuard', () => {
  function setup(itemCount: number) {
    const items = signal(
      Array.from({ length: itemCount }, (_, i) => ({
        mainProductItemId: i + 1,
        productId: i + 1,
        name: `Product ${i + 1}`,
        quantity: 1,
        originalPrice: 10,
        salePrice: null,
        primaryImageUrl: null,
      }))
    );

    const mockCartAcl = {
      items,
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

    return { items };
  }

  it('redirects to /cart when the cart is empty', async () => {
    setup(0);
    const harness = await RouterTestingHarness.create('/checkout');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/cart');
    expect(harness).toBeDefined();
  });

  it('allows navigation to /checkout when the cart has items', async () => {
    setup(2);
    const harness = await RouterTestingHarness.create('/checkout');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/checkout');
    expect(harness).toBeDefined();
  });
});
