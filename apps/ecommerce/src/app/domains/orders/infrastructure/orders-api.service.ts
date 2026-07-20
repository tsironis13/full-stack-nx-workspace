import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { REQUIRES_AUTH } from '../../../core/public-api';
import type { OrderHistoryResponseWire } from './orders-api.model';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);

  getOrderHistory(): Observable<OrderHistoryResponseWire> {
    return this.http.get<OrderHistoryResponseWire>('/api/orders', {
      context: new HttpContext().set(REQUIRES_AUTH, true),
    });
  }
}
