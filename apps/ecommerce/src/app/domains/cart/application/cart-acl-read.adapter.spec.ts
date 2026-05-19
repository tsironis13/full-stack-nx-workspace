import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import type { CatalogCartLineSnapshot } from '../domain/public-api';
import { CartStore } from './cart.store';
import { CartAclReadAdapter } from './cart-acl-read.adapter';

function makeLine(
  overrides: Partial<CatalogCartLineSnapshot> = {},
): CatalogCartLineSnapshot {
  return {
    quantity: 1,
    productId: 1,
    mainProductItemId: 1,
    name: 'Product',
    salePrice: 9.99,
    originalPrice: null,
    primaryImageUrl: null,
    ...overrides,
  };
}

describe('CartAclReadAdapter', () => {
  let adapter: CartAclReadAdapter;
  let mockItems: ReturnType<typeof signal<CatalogCartLineSnapshot[]>>;

  function setup(items: CatalogCartLineSnapshot[] = []) {
    mockItems = signal(items);

    TestBed.configureTestingModule({
      providers: [
        CartAclReadAdapter,
        {
          provide: CartStore,
          useValue: {
            items: mockItems.asReadonly(),
            totalUnitCount: signal(0).asReadonly(),
            pendingMainProductItemId: signal(null).asReadonly(),
          },
        },
      ],
    });

    adapter = TestBed.inject(CartAclReadAdapter);
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('hasUnavailableItems()', () => {
    it('returns false when the cart is empty', () => {
      setup([]);
      expect(adapter.hasUnavailableItems()).toBe(false);
    });

    it('returns false when all items have available: true', () => {
      setup([
        makeLine({ mainProductItemId: 1, available: true }),
        makeLine({ mainProductItemId: 2, available: true }),
      ]);
      expect(adapter.hasUnavailableItems()).toBe(false);
    });

    it('returns true when at least one item has available: false', () => {
      setup([
        makeLine({ mainProductItemId: 1, available: true }),
        makeLine({ mainProductItemId: 2, available: false }),
      ]);
      expect(adapter.hasUnavailableItems()).toBe(true);
    });

    it('returns true when all items are unavailable', () => {
      setup([
        makeLine({ mainProductItemId: 1, available: false }),
        makeLine({ mainProductItemId: 2, available: false }),
      ]);
      expect(adapter.hasUnavailableItems()).toBe(true);
    });

    it('returns false for guest items without an available field (undefined)', () => {
      setup([
        makeLine({ mainProductItemId: 1 }),
        makeLine({ mainProductItemId: 2 }),
      ]);
      expect(adapter.hasUnavailableItems()).toBe(false);
    });

    it('returns false when mixed guest and available server items', () => {
      setup([
        makeLine({ mainProductItemId: 1 }),
        makeLine({ mainProductItemId: 2, available: true }),
      ]);
      expect(adapter.hasUnavailableItems()).toBe(false);
    });

    it('returns true when mixed guest items and one unavailable server item', () => {
      setup([
        makeLine({ mainProductItemId: 1 }),
        makeLine({ mainProductItemId: 2, available: false }),
      ]);
      expect(adapter.hasUnavailableItems()).toBe(true);
    });

    it('reacts to signal changes', () => {
      setup([makeLine({ mainProductItemId: 1, available: true })]);
      expect(adapter.hasUnavailableItems()).toBe(false);

      TestBed.runInInjectionContext(() => {
        mockItems.set([makeLine({ mainProductItemId: 1, available: false })]);
      });

      expect(adapter.hasUnavailableItems()).toBe(true);
    });
  });
});
