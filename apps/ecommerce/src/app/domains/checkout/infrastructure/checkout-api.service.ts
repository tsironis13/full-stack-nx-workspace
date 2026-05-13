import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  CreateOrderRequestWire,
  PlaceOrderResponseWire,
} from './checkout-api.model';

/**
 * HTTP wrapper for the `POST /api/orders` endpoint.
 *
 * Does **not** read `AuthStore` directly (boundary rule: `domain-infrastructure`
 * cannot import `lib-api`). The caller (application layer) is responsible for
 * supplying the Bearer token when the user is authenticated.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/orders';

  createOrder(
    dto: CreateOrderRequestWire,
    authToken?: string,
  ): Observable<PlaceOrderResponseWire> {
    const headers = authToken
      ? new HttpHeaders({ Authorization: `Bearer ${authToken}` })
      : undefined;
    return this.http.post<PlaceOrderResponseWire>(this.url, dto, { headers });
  }
}
