import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LocalStorageFacade } from '../../../core/public-api';
import {
  CLIENT_CART_SCHEMA_VERSION,
  GUEST_CART_LOCAL_STORAGE_KEY,
} from '../domain/public-api';
import { GuestCartStore } from './guest-cart.store';

describe('GuestCartStore', () => {
  let store: InstanceType<typeof GuestCartStore>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        GuestCartStore,
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    store = TestBed.inject(GuestCartStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('hydrates valid envelope from localStorage on init', () => {
    localStorage.setItem(
      GUEST_CART_LOCAL_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CLIENT_CART_SCHEMA_VERSION,
        items: [
          {
            quantity: 1,
            productId: 1,
            mainProductItemId: 99,
            name: 'Hydrated',
            salePrice: 5,
            originalPrice: null,
            primaryImageUrl: null,
          },
        ],
      })
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        GuestCartStore,
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const next = TestBed.inject(GuestCartStore);
    expect(next.items()).toHaveLength(1);
    expect(next.items()[0].name).toBe('Hydrated');
  });

  it('treats corrupt storage as empty cart', () => {
    localStorage.setItem(GUEST_CART_LOCAL_STORAGE_KEY, '{broken');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        GuestCartStore,
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const next = TestBed.inject(GuestCartStore);
    expect(next.items()).toEqual([]);
  });

  it('persists merge to storage', () => {
    store.addFromBrowseRow(
      {
        productId: 1,
        mainProductItemId: 7,
        name: 'A',
        salePrice: 1,
        originalPrice: 2,
        primaryImageUrl: null,
      },
      1
    );
    store.addFromBrowseRow(
      {
        productId: 1,
        mainProductItemId: 7,
        name: 'B',
        salePrice: 3,
        originalPrice: 2,
        primaryImageUrl: null,
      },
      1
    );
    const raw = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed?.items?.[0]?.quantity).toBe(2);
    expect(parsed?.items?.[0]?.name).toBe('B');
    expect(parsed?.items?.[0]?.salePrice).toBe(3);
  });

  it('decrement at 1 removes line and updates storage', () => {
    store.addFromBrowseRow(
      {
        productId: 1,
        mainProductItemId: 42,
        name: 'X',
        salePrice: 1,
        originalPrice: null,
        primaryImageUrl: null,
      },
      1
    );
    store.decrementLine(42);
    expect(store.items()).toHaveLength(0);
    const raw = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed?.items).toEqual([]);
  });
});
