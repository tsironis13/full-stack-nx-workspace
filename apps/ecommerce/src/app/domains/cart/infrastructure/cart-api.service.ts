import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CartApiResponseModel } from './cart-api.model';

@Injectable({ providedIn: 'root' })
export class CartApiService {
  readonly #http = inject(HttpClient);
  readonly #cartApiUrl = '/api/cart';

  getCart(accessToken: string): Observable<CartApiResponseModel> {
    return this.#http.get<CartApiResponseModel>(this.#cartApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  addItem(
    dto: {
      productItemId: number;
      quantity: number;
    },
    accessToken: string,
  ): Observable<CartApiResponseModel> {
    return this.#http.post<CartApiResponseModel>(
      `${this.#cartApiUrl}/items`,
      dto,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }

  updateItem(
    cartItemId: number,
    quantity: number,
    accessToken: string,
  ): Observable<CartApiResponseModel> {
    return this.#http.patch<CartApiResponseModel>(
      `${this.#cartApiUrl}/items/${cartItemId}`,
      { quantity },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }

  removeItem(
    cartItemId: number,
    accessToken: string,
  ): Observable<CartApiResponseModel> {
    return this.#http.delete<CartApiResponseModel>(
      `${this.#cartApiUrl}/items/${cartItemId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }
}
