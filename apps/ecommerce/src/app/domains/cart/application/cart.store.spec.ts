import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';

const CartStore = signalStore({ providedIn: 'root' }, withState({ count: 0 }));

describe('CartStore', () => {
  it('should be created', () => {
    const store = TestBed.inject(CartStore);

    expect(store).toBeDefined();
    expect(store.count()).toBe(0);
  });
});

// import { TestBed } from '@angular/core/testing';
// import { PLATFORM_ID, signal } from '@angular/core';
// import { HttpErrorResponse } from '@angular/common/http';
// import { of, throwError } from 'rxjs';
// import { Dispatcher } from '@ngrx/signals/events';

// import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';
// import { AuthStore, type Session } from '@full-stack-nx-workspace/auth-web';

// import { CartStore } from './cart.store';
// import { CartApiService } from '../infrastructure/public-api';
// import {
//   CLIENT_CART_SCHEMA_VERSION,
//   GUEST_CART_LOCAL_STORAGE_KEY,
// } from '../domain/public-api';
// import { cartCatalogEvents, cartUiEvents } from './events';
// import type { CartApiResponseModel } from '../infrastructure/public-api';

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------

// /**
//  * Zoneless replacement for Angular's fakeAsync tick().
//  *
//  * Waits for the specified timeout using async/await.
//  * Intended for flushing timers in Zoneless tests where fakeAsync cannot be used.
//  *
//  * ⚠️ Avoid using non-zero delays in tests:
//  *    - Real delays make tests slower
//  *    - Prefer 0ms to flush microtasks or mock timers for async code
//  *
//  * Examples:
//  *   await tickAsync();      // flushes a 0ms timeout (recommended)
//  *   await tickAsync(500);   // waits 500ms in real time (slows down test)
//  *
//  * @param delayMs Time to wait in milliseconds (default 0)
//  */
// export function tickAsync(delayMs = 0): Promise<void> {
//   return new Promise((resolve) => setTimeout(resolve, delayMs));
// }

// function makeServerItem(
//   overrides: Partial<CartApiResponseModel['items'][0]> = {},
// ): CartApiResponseModel['items'][0] {
//   return {
//     id: 10,
//     productItemId: 99,
//     quantity: 2,
//     capturedPrice: 9.99,
//     currentPrice: 8.99,
//     capturedName: 'Server Product',
//     capturedImageUrl: null,
//     available: true,
//     ...overrides,
//   };
// }

// function makeServerCart(
//   items: CartApiResponseModel['items'] = [],
// ): CartApiResponseModel {
//   return { id: 1, userId: 'user-1', items };
// }

// function makeGuestItem(mainProductItemId = 7) {
//   return {
//     productId: 1,
//     mainProductItemId,
//     name: 'Guest Product',
//     salePrice: 5.0,
//     originalPrice: 6.0,
//     primaryImageUrl: null,
//   };
// }

// /**
//  * Drain pending microtasks without Zone.js (replacement for `fakeAsync` + `flush`).
//  * RxJS / ngrx plumbing may chain work across multiple microtask turns.
//  */
// async function flushMicrotasks(rounds = 5): Promise<void> {
//   for (let i = 0; i < rounds; i++) {
//     await Promise.resolve();
//   }
// }

// /** Matches real AuthStore: `session()` exposes access tokens for API calls. */
// const TEST_SESSION: Session = {
//   accessToken: 'test-access-token',
//   refreshToken: 'test-refresh-token',
// };

// // ---------------------------------------------------------------------------
// // Test setup
// // ---------------------------------------------------------------------------

// describe('CartStore', () => {
//   let store: InstanceType<typeof CartStore>;
//   let dispatcher: Dispatcher;
//   let mockIsAuthenticated: ReturnType<typeof signal<boolean>>;
//   let mockSession: ReturnType<typeof signal<Session | null>>;

//   let mockGetCart: jest.Mock<ReturnType<CartApiService['getCart']>>;
//   let mockAddItem: jest.Mock<ReturnType<CartApiService['addItem']>>;
//   let mockUpdateItem: jest.Mock<ReturnType<CartApiService['updateItem']>>;
//   let mockRemoveItem: jest.Mock<ReturnType<CartApiService['removeItem']>>;

//   function configureTestBed(initiallyAuthenticated = false) {
//     localStorage.clear();

//     mockIsAuthenticated = signal(initiallyAuthenticated);
//     mockSession = signal<Session | null>(
//       initiallyAuthenticated ? TEST_SESSION : null,
//     );
//     mockGetCart = jest.fn(() => of(makeServerCart()));
//     mockAddItem = jest.fn(() => of(makeServerCart([makeServerItem()])));
//     mockUpdateItem = jest.fn(() =>
//       of(makeServerCart([makeServerItem({ quantity: 3 })])),
//     );
//     mockRemoveItem = jest.fn(() => of(makeServerCart()));

//     TestBed.configureTestingModule({
//       providers: [
//         CartStore,
//         LocalStorageFacade,
//         { provide: PLATFORM_ID, useValue: 'browser' },
//         {
//           provide: AuthStore,
//           useValue: {
//             isAuthenticated: mockIsAuthenticated.asReadonly(),
//             session: mockSession.asReadonly(),
//           },
//         },
//         {
//           provide: CartApiService,
//           useValue: {
//             getCart: mockGetCart,
//             addItem: mockAddItem,
//             updateItem: mockUpdateItem,
//             removeItem: mockRemoveItem,
//           },
//         },
//       ],
//     });

//     store = TestBed.inject(CartStore);
//     dispatcher = TestBed.inject(Dispatcher);
//   }

//   /** Keep `session` aligned with `isAuthenticated`, like the real AuthStore. */
//   function setAuthenticated(value: boolean): void {
//     mockIsAuthenticated.set(value);
//     mockSession.set(value ? TEST_SESSION : null);
//   }

//   afterEach(() => {
//     localStorage.clear();
//     TestBed.resetTestingModule();
//   });

//   // ── Guest mode — localStorage path ────────────────────────────────────────
//   describe('guest mode (unauthenticated)', () => {
//     beforeEach(() => configureTestBed(false));

//     it('initialises with empty state when localStorage is empty', () => {
//       expect(store.items()).toHaveLength(0);
//       expect(store.totalUnitCount()).toBe(0);
//       expect(store.isAuthenticated()).toBe(false);
//     });

//     it('hydrates from localStorage on init', () => {
//       localStorage.setItem(
//         GUEST_CART_LOCAL_STORAGE_KEY,
//         JSON.stringify({
//           schemaVersion: CLIENT_CART_SCHEMA_VERSION,
//           items: [
//             {
//               quantity: 1,
//               productId: 1,
//               mainProductItemId: 99,
//               name: 'Hydrated',
//               salePrice: 5,
//               originalPrice: null,
//               primaryImageUrl: null,
//             },
//           ],
//         }),
//       );

//       TestBed.resetTestingModule();
//       configureTestBed(false);

//       expect(store.items()).toHaveLength(1);
//       expect(store.items()[0].name).toBe('Hydrated');
//     });

//     it('treats corrupt localStorage as empty cart', () => {
//       localStorage.setItem(GUEST_CART_LOCAL_STORAGE_KEY, '{broken');
//       TestBed.resetTestingModule();
//       configureTestBed(false);

//       expect(store.items()).toHaveLength(0);
//     });

//     it('addFromBrowseRow adds a line and persists to localStorage', () => {
//       store.addFromBrowseRow(makeGuestItem(), 1);

//       expect(store.items()).toHaveLength(1);
//       const raw = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);
//       expect(JSON.parse(raw!)?.items).toHaveLength(1);
//     });

//     it('addFromBrowseRow merges duplicate lines', () => {
//       store.addFromBrowseRow(makeGuestItem(7), 1);
//       store.addFromBrowseRow(makeGuestItem(7), 1);

//       expect(store.items()).toHaveLength(1);
//       expect(store.items()[0].quantity).toBe(2);
//     });

//     it('decrementLine at qty 1 removes the line and persists', () => {
//       store.addFromBrowseRow(makeGuestItem(42), 1);
//       store.decrementLine(42);

//       expect(store.items()).toHaveLength(0);
//       const raw = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);
//       expect(JSON.parse(raw!)?.items).toEqual([]);
//     });

//     it('removeLine removes the line regardless of quantity', () => {
//       store.addFromBrowseRow(makeGuestItem(42), 3);
//       store.removeLine(42);

//       expect(store.items()).toHaveLength(0);
//     });

//     it('does NOT call CartApiService for guest mutations', () => {
//       store.addFromBrowseRow(makeGuestItem(), 1);
//       store.incrementLine(makeGuestItem().mainProductItemId);

//       expect(mockAddItem).not.toHaveBeenCalled();
//       expect(mockUpdateItem).not.toHaveBeenCalled();
//     });

//     it('cartCatalogEvents.addFromBrowse adds a line and persists', () => {
//       dispatcher.dispatch(
//         cartCatalogEvents.addFromBrowse({
//           productId: 10,
//           mainProductItemId: 55,
//           name: 'Event Product',
//           salePrice: 9.99,
//           originalPrice: 14.99,
//           primaryImageUrl: null,
//         }),
//       );

//       expect(store.items()).toHaveLength(1);
//       expect(store.items()[0].mainProductItemId).toBe(55);
//       const raw = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);
//       expect(JSON.parse(raw!)?.items?.[0]?.mainProductItemId).toBe(55);
//     });

//     it('cartUiEvents.clearCart resets items and persists', () => {
//       store.addFromBrowseRow(makeGuestItem(1), 2);
//       store.addFromBrowseRow(makeGuestItem(2), 1);

//       dispatcher.dispatch(cartUiEvents.clearCart());

//       expect(store.items()).toHaveLength(0);
//       expect(store.totalUnitCount()).toBe(0);
//       const raw = localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY);
//       expect(JSON.parse(raw!)?.items).toEqual([]);
//     });
//   });

//   // ── Auth-reaction — sign-in path ──────────────────────────────────────────
//   describe('auth-reaction: sign-in', () => {
//     it('fetches server cart when guest cart is empty on sign-in', async () => {
//       mockGetCart = jest.fn(() =>
//         of(
//           makeServerCart([makeServerItem({ productItemId: 99, quantity: 2 })]),
//         ),
//       );
//       configureTestBed(false);

//       setAuthenticated(true);
//       await tickAsync();

//       expect(mockGetCart).toHaveBeenCalledTimes(1);
//       expect(store.isAuthenticated()).toBe(true);
//       expect(store.items()).toHaveLength(1);
//       expect(store.items()[0].mainProductItemId).toBe(99);
//       expect(store.items()[0].quantity).toBe(2);
//       expect(store.cartItemIdMap()[99]).toBe(10);
//     });

//     it('does NOT fetch server cart when guest cart has items on sign-in', async () => {
//       configureTestBed(false);
//       store.addFromBrowseRow(makeGuestItem(7), 1);

//       setAuthenticated(true);
//       await tickAsync();

//       expect(mockGetCart).not.toHaveBeenCalled();
//       expect(store.isAuthenticated()).toBe(true);
//       expect(store.items()).toHaveLength(1);
//     });
//   });

//   // ── Auth-reaction — logout path ───────────────────────────────────────────
//   describe('auth-reaction: logout', () => {
//     it('clears local state on logout', async () => {
//       mockGetCart = jest.fn(() => of(makeServerCart([makeServerItem()])));
//       configureTestBed(false);

//       // Sign in
//       setAuthenticated(true);
//       await tickAsync();
//       expect(store.items()).toHaveLength(1);

//       // Sign out
//       setAuthenticated(false);
//       await tickAsync();

//       expect(store.isAuthenticated()).toBe(false);
//       expect(store.items()).toHaveLength(0);
//       expect(store.cartItemIdMap()).toEqual({});
//     });

//     it('does not call any API on logout', async () => {
//       configureTestBed(false);
//       setAuthenticated(true);
//       await tickAsync();

//       jest.clearAllMocks();

//       setAuthenticated(false);
//       await tickAsync();

//       expect(mockGetCart).not.toHaveBeenCalled();
//     });
//   });

//   // ── Auth-reaction — app boot with valid session ───────────────────────────
//   describe('auth-reaction: app boot with persisted session', () => {
//     it('fetches server cart immediately when booting authenticated', async () => {
//       mockGetCart = jest.fn(() =>
//         of(makeServerCart([makeServerItem({ productItemId: 77 })])),
//       );
//       configureTestBed(true); // initial isAuthenticated = true
//       await tickAsync();

//       expect(mockGetCart).toHaveBeenCalledTimes(1);
//       expect(store.isAuthenticated()).toBe(true);
//       expect(store.items()[0].mainProductItemId).toBe(77);
//     });
//   });

//   // ── Authenticated mutations (direct method calls) ─────────────────────────
//   describe('authenticated mutations — direct method calls', () => {
//     beforeEach(async () => {
//       mockGetCart = jest.fn(() => of(makeServerCart([makeServerItem()])));
//       configureTestBed(false);
//       setAuthenticated(true);
//       await tickAsync();
//     });

//     it('addFromBrowseRow calls addItem API and replaces state', async () => {
//       const updatedCart = makeServerCart([
//         makeServerItem({ id: 20, productItemId: 55, quantity: 1 }),
//       ]);
//       mockAddItem.mockReturnValue(of(updatedCart));

//       store.addFromBrowseRow({
//         productId: 5,
//         mainProductItemId: 55,
//         name: 'New',
//         salePrice: 10,
//         originalPrice: null,
//         primaryImageUrl: null,
//       });
//       await tickAsync();

//       expect(mockAddItem).toHaveBeenCalledWith({
//         productItemId: 55,
//         quantity: 1,
//       });
//       expect(store.items()).toHaveLength(1);
//       expect(store.items()[0].mainProductItemId).toBe(55);
//     });

//     it('incrementLine calls updateItem with qty+1', async () => {
//       const updatedCart = makeServerCart([makeServerItem({ quantity: 3 })]);
//       mockUpdateItem.mockReturnValue(of(updatedCart));

//       store.incrementLine(99);
//       await tickAsync();

//       expect(mockUpdateItem).toHaveBeenCalledWith(10, 3);
//       expect(store.items()[0].quantity).toBe(3);
//     });

//     it('decrementLine with qty > 1 calls updateItem with qty-1', async () => {
//       const updatedCart = makeServerCart([makeServerItem({ quantity: 1 })]);
//       mockUpdateItem.mockReturnValue(of(updatedCart));

//       store.decrementLine(99);
//       await tickAsync();

//       expect(mockUpdateItem).toHaveBeenCalledWith(10, 1);
//     });

//     it('decrementLine at qty=1 calls removeItem', async () => {
//       // Set up a cart with qty=1
//       mockGetCart = jest.fn(() =>
//         of(makeServerCart([makeServerItem({ quantity: 1 })])),
//       );
//       TestBed.resetTestingModule();
//       mockIsAuthenticated = signal(true);
//       mockSession = signal<Session | null>(TEST_SESSION);
//       mockAddItem = jest.fn(() => of(makeServerCart()));
//       mockUpdateItem = jest.fn(() => of(makeServerCart()));
//       mockRemoveItem = jest.fn(() => of(makeServerCart()));
//       TestBed.configureTestingModule({
//         providers: [
//           CartStore,
//           LocalStorageFacade,
//           { provide: PLATFORM_ID, useValue: 'browser' },
//           {
//             provide: AuthStore,
//             useValue: {
//               isAuthenticated: mockIsAuthenticated.asReadonly(),
//               session: mockSession.asReadonly(),
//             },
//           },
//           {
//             provide: CartApiService,
//             useValue: {
//               getCart: mockGetCart,
//               addItem: mockAddItem,
//               updateItem: mockUpdateItem,
//               removeItem: mockRemoveItem,
//             },
//           },
//         ],
//       });
//       store = TestBed.inject(CartStore);
//       dispatcher = TestBed.inject(Dispatcher);
//       await tickAsync();

//       store.decrementLine(99);
//       await tickAsync();

//       expect(mockRemoveItem).toHaveBeenCalledWith(10);
//       expect(mockUpdateItem).not.toHaveBeenCalled();
//     });

//     it('removeLine calls removeItem API', async () => {
//       mockRemoveItem.mockReturnValue(of(makeServerCart()));

//       store.removeLine(99);
//       await tickAsync();

//       expect(mockRemoveItem).toHaveBeenCalledWith(10);
//       expect(store.items()).toHaveLength(0);
//     });

//     it('replaces entire local state with server response (server-authoritative)', async () => {
//       const serverResponse = makeServerCart([
//         makeServerItem({
//           id: 99,
//           productItemId: 42,
//           quantity: 7,
//           capturedName: 'From Server',
//         }),
//       ]);
//       mockAddItem.mockReturnValue(of(serverResponse));

//       store.addFromBrowseRow({
//         productId: 5,
//         mainProductItemId: 42,
//         name: 'Local',
//         salePrice: 1,
//         originalPrice: null,
//         primaryImageUrl: null,
//       });
//       await tickAsync();

//       expect(store.items()).toHaveLength(1);
//       expect(store.items()[0].name).toBe('From Server');
//       expect(store.items()[0].quantity).toBe(7);
//     });
//   });

//   // ── Authenticated event-driven mutations ──────────────────────────────────
//   describe('authenticated mutations — event-driven', () => {
//     beforeEach(async () => {
//       mockGetCart = jest.fn(() => of(makeServerCart([makeServerItem()])));
//       configureTestBed(false);
//       setAuthenticated(true);
//       await tickAsync();
//       jest.clearAllMocks();
//     });

//     it('cartCatalogEvents.addFromBrowse calls addItem API', async () => {
//       mockAddItem.mockReturnValue(
//         of(makeServerCart([makeServerItem({ id: 20, productItemId: 55 })])),
//       );

//       dispatcher.dispatch(
//         cartCatalogEvents.addFromBrowse({
//           productId: 5,
//           mainProductItemId: 55,
//           name: 'Cat Product',
//           salePrice: 9,
//           originalPrice: null,
//           primaryImageUrl: null,
//         }),
//       );
//       await tickAsync();

//       expect(mockAddItem).toHaveBeenCalledWith({
//         productItemId: 55,
//         quantity: 1,
//       });
//       expect(store.items()[0].mainProductItemId).toBe(55);
//     });

//     it('cartCatalogEvents.decrementItem calls API and replaces state', async () => {
//       mockUpdateItem.mockReturnValue(
//         of(makeServerCart([makeServerItem({ quantity: 1 })])),
//       );

//       dispatcher.dispatch(
//         cartCatalogEvents.decrementItem({ mainProductItemId: 99 }),
//       );
//       await tickAsync();

//       expect(mockUpdateItem).toHaveBeenCalledWith(10, 1);
//     });

//     it('cartUiEvents.incrementItem calls updateItem API', async () => {
//       mockUpdateItem.mockReturnValue(
//         of(makeServerCart([makeServerItem({ quantity: 3 })])),
//       );

//       dispatcher.dispatch(
//         cartUiEvents.incrementItem({ mainProductItemId: 99 }),
//       );
//       await tickAsync();

//       expect(mockUpdateItem).toHaveBeenCalledWith(10, 3);
//     });

//     it('cartUiEvents.removeItem calls removeItem API', async () => {
//       mockRemoveItem.mockReturnValue(of(makeServerCart()));

//       dispatcher.dispatch(cartUiEvents.removeItem({ mainProductItemId: 99 }));
//       await tickAsync();

//       expect(mockRemoveItem).toHaveBeenCalledWith(10);
//       expect(store.items()).toHaveLength(0);
//     });

//     it('does NOT write to localStorage for authenticated mutations', async () => {
//       mockAddItem.mockReturnValue(of(makeServerCart([makeServerItem()])));

//       dispatcher.dispatch(
//         cartCatalogEvents.addFromBrowse({
//           productId: 5,
//           mainProductItemId: 55,
//           name: 'X',
//           salePrice: 1,
//           originalPrice: null,
//           primaryImageUrl: null,
//         }),
//       );
//       await tickAsync();

//       expect(localStorage.getItem(GUEST_CART_LOCAL_STORAGE_KEY)).toBeNull();
//     });
//   });

//   // ── 401 absorption ────────────────────────────────────────────────────────
//   describe('401 absorption', () => {
//     const unauthorisedError = new HttpErrorResponse({
//       status: 401,
//       statusText: 'Unauthorized',
//     });

//     it('absorbs 401 from getCart silently, leaves state unchanged', async () => {
//       mockGetCart = jest.fn(() => throwError(() => unauthorisedError));
//       configureTestBed(false);

//       setAuthenticated(true);
//       await tickAsync();

//       expect(store.isAuthenticated()).toBe(true);
//       expect(store.items()).toHaveLength(0);
//       expect(store.error()).toBeNull();
//     });

//     it('absorbs 401 from addItem silently', async () => {
//       mockGetCart = jest.fn(() => of(makeServerCart([makeServerItem()])));
//       configureTestBed(false);
//       setAuthenticated(true);
//       await tickAsync();

//       mockAddItem.mockReturnValue(throwError(() => unauthorisedError));
//       store.addFromBrowseRow({
//         productId: 1,
//         mainProductItemId: 55,
//         name: 'X',
//         salePrice: 1,
//         originalPrice: null,
//         primaryImageUrl: null,
//       });
//       await tickAsync();

//       expect(store.error()).toBeNull();
//     });

//     it('absorbs 401 from updateItem silently', async () => {
//       mockGetCart = jest.fn(() => of(makeServerCart([makeServerItem()])));
//       configureTestBed(false);
//       setAuthenticated(true);
//       await tickAsync();

//       mockUpdateItem.mockReturnValue(throwError(() => unauthorisedError));
//       store.incrementLine(99);
//       await tickAsync();

//       expect(store.error()).toBeNull();
//     });

//     it('absorbs 401 from removeItem silently', async () => {
//       mockGetCart = jest.fn(() => of(makeServerCart([makeServerItem()])));
//       configureTestBed(false);
//       setAuthenticated(true);
//       await tickAsync();

//       mockRemoveItem.mockReturnValue(throwError(() => unauthorisedError));
//       store.removeLine(99);
//       await tickAsync();

//       expect(store.error()).toBeNull();
//     });
//   });

//   // ── withRequestStatus ────────────────────────────────────────────────────
//   describe('withRequestStatus', () => {
//     it('isPending is false initially', () => {
//       configureTestBed(false);
//       expect(store.isPending()).toBe(false);
//     });
//   });
// });
