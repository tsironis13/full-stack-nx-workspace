import { HttpErrorResponse } from '@angular/common/http';

import {
  GENERIC_ERROR_KEY,
  mapHttpErrorToTranslocoKey,
} from './map-http-error';

describe('mapHttpErrorToTranslocoKey', () => {
  it('prefers a body message code over HTTP status', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: {
        code: 'cart.quantity.min',
        message: 'Quantity must be at least 1',
      },
    });
    expect(mapHttpErrorToTranslocoKey(err)).toEqual({
      key: 'cart.quantity.min',
    });
  });

  it('forwards params from the body', () => {
    const err = new HttpErrorResponse({
      status: 404,
      error: {
        code: 'cart.item.notFound',
        message: 'Cart item 9 not found',
        params: { cartItemId: 9 },
      },
    });
    expect(mapHttpErrorToTranslocoKey(err)).toEqual({
      key: 'cart.item.notFound',
      params: { cartItemId: 9 },
    });
  });

  it('maps known HTTP statuses when no code is present', () => {
    expect(
      mapHttpErrorToTranslocoKey(
        new HttpErrorResponse({ status: 401, error: { message: 'nope' } }),
      ),
    ).toEqual({ key: 'errors.http.401' });
    expect(
      mapHttpErrorToTranslocoKey(new HttpErrorResponse({ status: 404 })),
    ).toEqual({ key: 'errors.http.404' });
    expect(
      mapHttpErrorToTranslocoKey(new HttpErrorResponse({ status: 503 })),
    ).toEqual({ key: 'errors.http.503' });
  });

  it('uses generic chrome for 400 and 500 without a code', () => {
    expect(
      mapHttpErrorToTranslocoKey(
        new HttpErrorResponse({
          status: 400,
          error: { message: 'Internal details' },
        }),
      ),
    ).toEqual({ key: GENERIC_ERROR_KEY });
    expect(
      mapHttpErrorToTranslocoKey(
        new HttpErrorResponse({
          status: 500,
          error: 'Internal server error',
        }),
      ),
    ).toEqual({ key: GENERIC_ERROR_KEY });
  });

  it('uses generic chrome for non-HTTP failures', () => {
    expect(mapHttpErrorToTranslocoKey(new Error('boom'))).toEqual({
      key: GENERIC_ERROR_KEY,
    });
  });
});
