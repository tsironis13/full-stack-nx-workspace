import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { AuthStore } from '@full-stack-nx-workspace/auth-web';
import { CartAclReadAdapter } from '../../cart/application/anti-corruption-layer';
import { CheckoutApiService } from '../infrastructure/public-api';
import { CheckoutStore } from './checkout.store';
import type { PlaceOrderResponseWire } from '../infrastructure/public-api';

const MOCK_CART_ITEMS = [
  {
    quantity: 2,
    productId: 1,
    mainProductItemId: 10,
    name: 'Product A',
    salePrice: 9.99,
    originalPrice: 14.99,
    primaryImageUrl: null,
  },
];

const MOCK_SHIPPING = {
  fullName: 'John Doe',
  streetAddress: '123 Main St',
  city: 'Athens',
  postalCode: '12345',
  country: 'GR',
  phone: '+30 210 0000000',
};

const MOCK_CONFIRMED_ORDER: PlaceOrderResponseWire = {
  orderId: 42,
  status: 'confirmed',
  totalAmount: 19.98,
  createdAt: '2026-05-13T00:00:00.000Z',
};

function createCartAclMock() {
  return {
    items: signal(MOCK_CART_ITEMS),
    totalUnitCount: signal(2),
    itemQuantities: signal(new Map()),
    cartSubtotal: signal(19.98),
  };
}

function createAuthStoreMock(authenticated = false) {
  return {
    isAuthenticated: signal(authenticated),
    session: signal(
      authenticated
        ? { accessToken: 'test-token', refreshToken: 'refresh' }
        : null,
    ),
    authUser: signal(null),
  };
}

function createApiServiceMock() {
  return { createOrder: jest.fn() };
}

describe('CheckoutStore', () => {
  let store: InstanceType<typeof CheckoutStore>;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [
        CheckoutStore,
        { provide: CartAclReadAdapter, useValue: createCartAclMock() },
        { provide: AuthStore, useValue: createAuthStoreMock(false) },
        { provide: CheckoutApiService, useValue: apiServiceMock },
      ],
    });

    store = TestBed.inject(CheckoutStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('starts in idle status with no error or confirmed order', () => {
    expect(store.status()).toBe('idle');
    expect(store.error()).toBeNull();
    expect(store.confirmedOrder()).toBeNull();
    expect(store.isSubmitting()).toBe(false);
    expect(store.isSuccess()).toBe(false);
  });

  describe('idle → submitting → success transition', () => {
    it('transitions through submitting to success and stores the confirmed order', () => {
      apiServiceMock.createOrder.mockReturnValue(of(MOCK_CONFIRMED_ORDER));

      store.placeOrder({ shippingAddress: MOCK_SHIPPING });

      expect(store.status()).toBe('success');
      expect(store.isSuccess()).toBe(true);
      expect(store.isSubmitting()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.confirmedOrder()).toEqual(MOCK_CONFIRMED_ORDER);
    });

    it('includes guestEmail in the request when provided and user is a guest', () => {
      apiServiceMock.createOrder.mockReturnValue(of(MOCK_CONFIRMED_ORDER));

      store.placeOrder({
        guestEmail: 'guest@example.com',
        shippingAddress: MOCK_SHIPPING,
      });

      const [dto, authToken] = apiServiceMock.createOrder.mock.calls[0] as [
        { guestEmail?: string },
        string | undefined,
      ];
      expect(dto.guestEmail).toBe('guest@example.com');
      expect(authToken).toBeUndefined();
    });

    it('omits guestEmail and attaches auth token when user is authenticated', () => {
      const authenticatedApiMock = createApiServiceMock();
      authenticatedApiMock.createOrder.mockReturnValue(of(MOCK_CONFIRMED_ORDER));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          CheckoutStore,
          { provide: CartAclReadAdapter, useValue: createCartAclMock() },
          { provide: AuthStore, useValue: createAuthStoreMock(true) },
          { provide: CheckoutApiService, useValue: authenticatedApiMock },
        ],
      });

      const authenticatedStore = TestBed.inject(CheckoutStore);
      authenticatedStore.placeOrder({
        guestEmail: 'should-be-ignored@example.com',
        shippingAddress: MOCK_SHIPPING,
      });

      const [dto, authToken] = authenticatedApiMock.createOrder.mock.calls[0] as [
        { guestEmail?: string },
        string | undefined,
      ];
      expect(dto.guestEmail).toBeUndefined();
      expect(authToken).toBe('test-token');
    });

    it('maps cart items to productItemId + quantity pairs', () => {
      apiServiceMock.createOrder.mockReturnValue(of(MOCK_CONFIRMED_ORDER));

      store.placeOrder({ shippingAddress: MOCK_SHIPPING });

      const [dto] = apiServiceMock.createOrder.mock.calls[0] as [{ items: unknown[] }];
      expect(dto.items).toEqual([{ productItemId: 10, quantity: 2 }]);
    });
  });

  describe('idle → submitting → error transition', () => {
    it('transitions to error status and stores the error message on API failure', () => {
      apiServiceMock.createOrder.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      store.placeOrder({ shippingAddress: MOCK_SHIPPING });

      expect(store.status()).toBe('error');
      expect(store.error()).toBe('Network error');
      expect(store.isSuccess()).toBe(false);
      expect(store.isSubmitting()).toBe(false);
      expect(store.confirmedOrder()).toBeNull();
    });

    it('falls back to a generic message for non-Error rejections', () => {
      apiServiceMock.createOrder.mockReturnValue(
        throwError(() => 'plain string error'),
      );

      store.placeOrder({ shippingAddress: MOCK_SHIPPING });

      expect(store.status()).toBe('error');
      expect(store.error()).toBeTruthy();
    });

    it('allows retry: can submit again after an error', () => {
      apiServiceMock.createOrder.mockReturnValueOnce(
        throwError(() => new Error('First failure')),
      );
      store.placeOrder({ shippingAddress: MOCK_SHIPPING });
      expect(store.status()).toBe('error');

      apiServiceMock.createOrder.mockReturnValueOnce(of(MOCK_CONFIRMED_ORDER));
      store.placeOrder({ shippingAddress: MOCK_SHIPPING });

      expect(store.status()).toBe('success');
      expect(store.confirmedOrder()).toEqual(MOCK_CONFIRMED_ORDER);
    });
  });

  describe('resetStatus', () => {
    it('resets status to idle and clears the error message', () => {
      apiServiceMock.createOrder.mockReturnValue(
        throwError(() => new Error('Fail')),
      );
      store.placeOrder({ shippingAddress: MOCK_SHIPPING });
      expect(store.status()).toBe('error');

      store.resetStatus();

      expect(store.status()).toBe('idle');
      expect(store.error()).toBeNull();
    });
  });
});
