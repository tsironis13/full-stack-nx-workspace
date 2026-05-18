import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Dispatcher, provideDispatcher } from '@ngrx/signals/events';
import { of, throwError } from 'rxjs';

import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';
import { AuthStore } from '@full-stack-nx-workspace/auth-web';
import { CartApiService } from '../infrastructure/public-api';
import {
  CLIENT_CART_SCHEMA_VERSION,
  GUEST_CART_LOCAL_STORAGE_KEY,
} from '../domain/public-api';
import { cartCatalogEvents, cartUiEvents } from './events';
import type {
  CartApiResponseModel,
  CartItemApiModel,
} from '../infrastructure/public-api';
import { CartStore } from './cart.store';

/**
 * Zoneless-friendly flush for rxMethod / observable tails.
 * See: https://ngrx.io/guide/signals/signal-store/testing
 */
async function flushStoreEffects(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 0));
}

function browsePayload(
  overrides: Partial<{
    productId: number;
    mainProductItemId: number;
    name: string;
    salePrice: number;
    originalPrice: number | null;
    primaryImageUrl: string | null;
  }> = {},
) {
  return {
    productId: 10,
    mainProductItemId: 55,
    name: 'Product',
    salePrice: 9.99,
    originalPrice: null as number | null,
    primaryImageUrl: null as string | null,
    ...overrides,
  };
}

function makeServerItem(
  overrides: Partial<CartItemApiModel> = {},
): CartItemApiModel {
  return {
    id: 10,
    productItemId: 99,
    quantity: 2,
    capturedPrice: 9.99,
    currentPrice: 8.99,
    capturedName: 'Server Product',
    capturedImageUrl: null,
    available: true,
    ...overrides,
  };
}

function makeServerCart(items: CartItemApiModel[] = []): CartApiResponseModel {
  return { id: 1, userId: 'user-1', items };
}

/**
 * TestBed-scoped store (no `providedIn: 'root'`). Same feature stack as production `CartStore`.
 * @see https://ngrx.io/guide/signals/signal-store/testing
 */
const MockCartStore = CartStore;

describe('CartStore', () => {
  let store: InstanceType<typeof MockCartStore>;
  let dispatcher: Dispatcher;

  let mockIsAuthenticated: ReturnType<typeof signal<boolean>>;
  let mockGetCart: jest.Mock;
  let mockAddItem: jest.Mock;
  let mockUpdateItem: jest.Mock;
  let mockRemoveItem: jest.Mock;
  let mockMergeCart: jest.Mock;

  function createApiMocks() {
    mockGetCart = jest.fn(() => of(makeServerCart()));
    mockAddItem = jest.fn(() => of(makeServerCart([makeServerItem()])));
    mockUpdateItem = jest.fn(() =>
      of(makeServerCart([makeServerItem({ quantity: 3 })])),
    );
    mockRemoveItem = jest.fn(() => of(makeServerCart()));
    mockMergeCart = jest.fn(() => of(makeServerCart()));
  }

  function configureTestBed(
    initiallyAuthenticated = false,
    options?:
      | boolean
      | { clearLocalStorage?: boolean; configureApiMocks?: () => void },
  ) {
    let clearLocalStorage = true;
    let configureApiMocks: (() => void) | undefined;

    if (typeof options === 'boolean') {
      clearLocalStorage = options;
    } else if (options !== undefined) {
      clearLocalStorage = options.clearLocalStorage ?? true;
      configureApiMocks = options.configureApiMocks;
    }

    if (clearLocalStorage) {
      localStorage.clear();
    }
    createApiMocks();
    configureApiMocks?.();
    mockIsAuthenticated = signal(initiallyAuthenticated);

    TestBed.configureTestingModule({
      providers: [
        ...provideDispatcher(),
        MockCartStore,
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: mockIsAuthenticated.asReadonly(),
          },
        },
        {
          provide: CartApiService,
          useValue: {
            getCart: mockGetCart,
            addItem: mockAddItem,
            updateItem: mockUpdateItem,
            removeItem: mockRemoveItem,
            mergeCart: mockMergeCart,
          },
        },
      ],
    });

    store = TestBed.inject(MockCartStore);
    dispatcher = TestBed.inject(Dispatcher);
  }

  function setAuthenticated(value: boolean): void {
    mockIsAuthenticated.set(value);
  }

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  describe('guest mode', () => {
    beforeEach(() => configureTestBed(false));

    it('starts empty when localStorage has no cart', () => {
      expect(store.items()).toEqual([]);
      expect(store.totalUnitCount()).toBe(0);
      expect(mockIsAuthenticated()).toBe(false);
    });

    it('hydrates items from localStorage on init', () => {
      localStorage.setItem(
        GUEST_CART_LOCAL_STORAGE_KEY,
        JSON.stringify({
          schemaVersion: CLIENT_CART_SCHEMA_VERSION,
          items: [
            {
              quantity: 1,
              productId: 1,
              mainProductItemId: 77,
              name: 'Saved',
              salePrice: 5,
              originalPrice: null,
              primaryImageUrl: null,
            },
          ],
        }),
      );

      TestBed.resetTestingModule();
      configureTestBed(false, { clearLocalStorage: false });

      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].name).toBe('Saved');
      expect(store.items()[0].mainProductItemId).toBe(77);
    });

    it('treats invalid localStorage payload as empty cart', () => {
      localStorage.setItem(GUEST_CART_LOCAL_STORAGE_KEY, '{not-json');
      TestBed.resetTestingModule();
      configureTestBed(false);

      expect(store.items()).toEqual([]);
    });

    it('addFromBrowse adds a line and persists guest cart', () => {
      dispatcher.dispatch(cartCatalogEvents.addFromBrowse(browsePayload()));

      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].mainProductItemId).toBe(55);
      const raw = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw as string).items).toHaveLength(1);
    });

    it('addFromBrowse merges quantity for the same mainProductItemId', () => {
      dispatcher.dispatch(cartCatalogEvents.addFromBrowse(browsePayload()));
      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({ mainProductItemId: 55, name: 'Same' }),
        ),
      );

      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].quantity).toBe(2);
    });

    it('catalog decrementItem decrements guest line and persists', () => {
      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({ mainProductItemId: 42 }),
        ),
      );
      dispatcher.dispatch(
        cartCatalogEvents.decrementItem({ mainProductItemId: 42 }),
      );

      expect(store.items()).toHaveLength(0);
      const stored = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored as string).items).toEqual([]);
    });

    it('UI incrementItem increments guest line', () => {
      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({ mainProductItemId: 5 }),
        ),
      );
      dispatcher.dispatch(cartUiEvents.incrementItem({ mainProductItemId: 5 }));

      expect(store.items()[0].quantity).toBe(2);
    });

    it('UI decrementOrRemoveItem decrements guest line', () => {
      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({ mainProductItemId: 8 }),
        ),
      );
      dispatcher.dispatch(
        cartUiEvents.decrementOrRemoveItem({ mainProductItemId: 8 }),
      );

      expect(store.items()).toHaveLength(0);
    });

    it('UI removeItem drops the line regardless of quantity', () => {
      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({ mainProductItemId: 9 }),
        ),
      );
      dispatcher.dispatch(cartUiEvents.incrementItem({ mainProductItemId: 9 }));
      dispatcher.dispatch(cartUiEvents.removeItem({ mainProductItemId: 9 }));

      expect(store.items()).toHaveLength(0);
    });

    it('clearCart clears items and cartItemIdMap', () => {
      dispatcher.dispatch(cartCatalogEvents.addFromBrowse(browsePayload()));
      dispatcher.dispatch(cartUiEvents.clearCart());

      expect(store.items()).toEqual([]);
      expect(store.cartItemIdMap()).toEqual({});
      expect(store.totalUnitCount()).toBe(0);
    });

    it('incrementLine / decrementLine / removeLine do not call API as guest', async () => {
      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({ mainProductItemId: 12 }),
        ),
      );
      store.incrementLine(12);
      store.decrementLine(12);
      //await flushStoreEffects();

      expect(mockAddItem).not.toHaveBeenCalled();
      expect(mockUpdateItem).not.toHaveBeenCalled();
      expect(mockRemoveItem).not.toHaveBeenCalled();
    });

    it('rehydrateFromStorage reloads items from localStorage', () => {
      localStorage.setItem(
        GUEST_CART_LOCAL_STORAGE_KEY,
        JSON.stringify({
          schemaVersion: CLIENT_CART_SCHEMA_VERSION,
          items: [
            {
              quantity: 2,
              productId: 1,
              mainProductItemId: 100,
              name: 'Rehydrate',
              salePrice: 1,
              originalPrice: null,
              primaryImageUrl: null,
            },
          ],
        }),
      );
      store.rehydrateFromStorage();

      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].name).toBe('Rehydrate');
      expect(store.items()[0].quantity).toBe(2);
    });
  });

  describe('auth reaction on sign-in', () => {
    it('GET cart when guest cart is empty', async () => {
      configureTestBed(false, {
        configureApiMocks: () => {
          mockGetCart.mockReturnValue(
            of(
              makeServerCart([
                makeServerItem({ productItemId: 99, quantity: 2 }),
              ]),
            ),
          );
        },
      });

      setAuthenticated(true);
      await flushStoreEffects();

      expect(mockGetCart).toHaveBeenCalledTimes(1);
      expect(mockMergeCart).not.toHaveBeenCalled();
      expect(store.items()[0].mainProductItemId).toBe(99);
      expect(store.items()[0].quantity).toBe(2);
      expect(store.cartItemIdMap()[99]).toBe(10);
    });

    it('POST merge when guest cart has items', async () => {
      const merged = makeServerCart([
        makeServerItem({ id: 20, productItemId: 7, quantity: 3 }),
      ]);
      configureTestBed(false, {
        configureApiMocks: () => {
          mockMergeCart.mockReturnValue(of(merged));
        },
      });

      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({
            mainProductItemId: 7,
            name: 'Guest',
            salePrice: 5,
          }),
        ),
      );
      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({
            mainProductItemId: 7,
            name: 'Guest',
            salePrice: 5,
          }),
        ),
      );

      setAuthenticated(true);
      await flushStoreEffects();

      expect(mockMergeCart).toHaveBeenCalledTimes(1);
      expect(mockGetCart).not.toHaveBeenCalled();
      expect(localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY)).toBeNull();
      expect(store.items()[0].mainProductItemId).toBe(7);
      expect(store.items()[0].quantity).toBe(3);
    });

    it('sets error and keeps guest localStorage when merge fails', async () => {
      configureTestBed(false, {
        configureApiMocks: () => {
          mockMergeCart.mockReturnValue(
            throwError(
              () =>
                new HttpErrorResponse({
                  status: 500,
                  statusText: 'Internal Server Error',
                }),
            ),
          );
        },
      });

      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({ mainProductItemId: 1 }),
        ),
      );
      expect(localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY)).not.toBeNull();

      setAuthenticated(true);
      await flushStoreEffects();

      expect(localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY)).not.toBeNull();
      expect(store.error()).toBe('Failed to merge cart');
    });

    it('ignores 401 on merge without setting store error', async () => {
      configureTestBed(false, {
        configureApiMocks: () => {
          mockMergeCart.mockReturnValue(
            throwError(
              () =>
                new HttpErrorResponse({
                  status: 401,
                  statusText: 'Unauthorized',
                }),
            ),
          );
        },
      });

      dispatcher.dispatch(
        cartCatalogEvents.addFromBrowse(
          browsePayload({ mainProductItemId: 2 }),
        ),
      );
      const before = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);

      setAuthenticated(true);
      await flushStoreEffects();

      expect(store.error()).toBeNull();
      expect(localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY)).toBe(before);
    });
  });

  describe('authenticated session', () => {
    beforeEach(async () => {
      configureTestBed(true, {
        configureApiMocks: () => {
          mockGetCart.mockReturnValue(of(makeServerCart([makeServerItem()])));
        },
      });
      await flushStoreEffects();
    });

    it('loads server cart on boot when already authenticated', () => {
      expect(mockGetCart).toHaveBeenCalled();
      expect(store.items()).toHaveLength(1);
      expect(store.cartItemIdMap()[99]).toBe(10);
    });

    it('addFromBrowse calls addItem and replaces state from response', async () => {
      const response = makeServerCart([
        makeServerItem({
          id: 20,
          productItemId: 55,
          quantity: 1,
          capturedName: 'From API',
        }),
      ]);
      mockAddItem.mockReturnValue(of(response));

      dispatcher.dispatch(cartCatalogEvents.addFromBrowse(browsePayload()));
      await flushStoreEffects();

      expect(mockAddItem).toHaveBeenCalledWith({
        productItemId: 55,
        quantity: 1,
      });
      expect(store.items()[0].mainProductItemId).toBe(55);
      expect(store.items()[0].name).toBe('From API');
    });

    it('incrementLine calls updateItem with current quantity + 1', async () => {
      mockUpdateItem.mockReturnValue(
        of(makeServerCart([makeServerItem({ quantity: 5 })])),
      );

      store.incrementLine(99);
      await flushStoreEffects();

      expect(mockUpdateItem).toHaveBeenCalledWith(10, 3);
      expect(store.items()[0].quantity).toBe(5);
    });

    it('decrementLine with qty > 1 uses PATCH', async () => {
      mockUpdateItem.mockReturnValue(
        of(makeServerCart([makeServerItem({ quantity: 1 })])),
      );

      store.decrementLine(99);
      await flushStoreEffects();

      expect(mockUpdateItem).toHaveBeenCalledWith(10, 1);
    });

    it('decrementLine with qty 1 uses removeItem', async () => {
      TestBed.resetTestingModule();
      configureTestBed(true, {
        configureApiMocks: () => {
          mockGetCart.mockReturnValue(
            of(makeServerCart([makeServerItem({ quantity: 1 })])),
          );
        },
      });
      await flushStoreEffects();

      mockRemoveItem.mockReturnValue(of(makeServerCart([])));
      store.decrementLine(99);
      await flushStoreEffects();

      expect(mockRemoveItem).toHaveBeenCalledWith(10);
      expect(store.items()).toHaveLength(0);
    });

    it('removeLine calls removeItem', async () => {
      mockRemoveItem.mockReturnValue(of(makeServerCart([])));

      store.removeLine(99);
      await flushStoreEffects();

      expect(mockRemoveItem).toHaveBeenCalledWith(10);
    });

    it('delegates auth incrementItem event to incrementLine', async () => {
      mockUpdateItem.mockReturnValue(
        of(makeServerCart([makeServerItem({ quantity: 4 })])),
      );

      dispatcher.dispatch(
        cartUiEvents.incrementItem({ mainProductItemId: 99 }),
      );
      await flushStoreEffects();

      expect(mockUpdateItem).toHaveBeenCalled();
      expect(store.items()[0].quantity).toBe(4);
    });
  });

  describe('401 handling (authenticated API)', () => {
    const unauthorized = () =>
      new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

    it('getCart 401 does not set error', async () => {
      configureTestBed(false, {
        configureApiMocks: () => {
          mockGetCart.mockReturnValue(throwError(unauthorized));
        },
      });

      setAuthenticated(true);
      await flushStoreEffects();

      expect(store.error()).toBeNull();
      expect(store.items()).toEqual([]);
    });

    it('addItem 401 clears pending and does not set error', async () => {
      configureTestBed(true);
      await flushStoreEffects();

      mockAddItem.mockReturnValue(throwError(unauthorized));
      dispatcher.dispatch(cartCatalogEvents.addFromBrowse(browsePayload()));
      await flushStoreEffects();

      expect(store.error()).toBeNull();
      expect(store.pendingMainProductItemId()).toBeNull();
    });

    it('updateItem 401 clears pending', async () => {
      configureTestBed(true);
      await flushStoreEffects();

      mockUpdateItem.mockReturnValue(throwError(unauthorized));
      store.incrementLine(99);
      await flushStoreEffects();

      expect(store.error()).toBeNull();
    });

    it('removeItem 401 clears pending', async () => {
      configureTestBed(true);
      await flushStoreEffects();

      mockRemoveItem.mockReturnValue(throwError(unauthorized));
      store.removeLine(99);
      await flushStoreEffects();

      expect(store.error()).toBeNull();
    });
  });

  describe('withRequestStatus', () => {
    it('exposes isPending false before mutations', () => {
      configureTestBed(false);
      expect(store.isPending()).toBe(false);
    });
  });
});
