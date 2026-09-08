import { TestBed } from '@angular/core/testing';
import { Dispatcher, provideDispatcher } from '@ngrx/signals/events';

import { cartShoppingEvents } from '../../cart/application/anti-corruption-layer';
import { CartItemConfirmHandler } from './cart-item-confirm.handler';

jest.mock('@full-stack-nx-workspace/shared', () =>
  jest.requireActual(
    '../../../../../../../libs/shared/src/lib/storage/local-storage.facade',
  ),
);

describe('CartItemConfirmHandler', () => {
  it('dispatches the Cart ACL addProductItem event on confirm submitAnswer', () => {
    TestBed.configureTestingModule({
      providers: [...provideDispatcher(), CartItemConfirmHandler],
    });
    const handler = TestBed.inject(CartItemConfirmHandler);
    const dispatcher = TestBed.inject(Dispatcher);
    const spy = jest.spyOn(dispatcher, 'dispatch');

    handler.apply({
      quantity: '2',
      productId: '7',
      productItemId: '42',
      inventory: '8',
      name: 'Trail Bottle',
      salePrice: '19.5',
      originalPrice: '24',
      imageUrl: 'https://cdn.example/bottle.jpg',
    });

    expect(spy.mock.calls.flat()).toEqual(
      expect.arrayContaining([
        cartShoppingEvents.addProductItem({
          productId: 7,
          productItemId: 42,
          quantity: 2,
          name: 'Trail Bottle',
          salePrice: 19.5,
          originalPrice: 24,
          primaryImageUrl: 'https://cdn.example/bottle.jpg',
        }),
      ]),
    );
  });

  it('does not dispatch on cancel', () => {
    TestBed.configureTestingModule({
      providers: [...provideDispatcher(), CartItemConfirmHandler],
    });
    const handler = TestBed.inject(CartItemConfirmHandler);
    const dispatcher = TestBed.inject(Dispatcher);
    const spy = jest.spyOn(dispatcher, 'dispatch');

    expect(handler.apply({ abandon: 'true' })).toEqual({ kind: 'cancel' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not dispatch on cancel mid-pickers', () => {
    TestBed.configureTestingModule({
      providers: [...provideDispatcher(), CartItemConfirmHandler],
    });
    const handler = TestBed.inject(CartItemConfirmHandler);
    const dispatcher = TestBed.inject(Dispatcher);
    const spy = jest.spyOn(dispatcher, 'dispatch');

    expect(
      handler.apply({
        pick: 'true',
        abandon: 'true',
        productId: '7',
        checked_1: true,
        productItemId_1: '1',
        inventory_1: '8',
      }),
    ).toEqual({ kind: 'cancel' });
    expect(spy).not.toHaveBeenCalled();
  });
});
