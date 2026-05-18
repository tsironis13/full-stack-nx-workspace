import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { REQUIRES_AUTH } from '../../../core/public-api';
import { CartApiResponseModel, MergeCartItemDto } from './cart-api.model';

const authContext = () => new HttpContext().set(REQUIRES_AUTH, true);

@Injectable({ providedIn: 'root' })
export class CartApiService {
  readonly #http = inject(HttpClient);
  readonly #cartApiUrl = '/api/cart';

  getCart(): Observable<CartApiResponseModel> {
    return this.#http.get<CartApiResponseModel>(this.#cartApiUrl, {
      context: authContext(),
    });
  }

  addItem(dto: {
    productItemId: number;
    quantity: number;
  }): Observable<CartApiResponseModel> {
    return this.#http.post<CartApiResponseModel>(
      `${this.#cartApiUrl}/items`,
      dto,
      { context: authContext() },
    );
  }

  updateItem(
    cartItemId: number,
    quantity: number,
  ): Observable<CartApiResponseModel> {
    return this.#http.patch<CartApiResponseModel>(
      `${this.#cartApiUrl}/items/${cartItemId}`,
      { quantity },
      { context: authContext() },
    );
  }

  removeItem(cartItemId: number): Observable<CartApiResponseModel> {
    return this.#http.delete<CartApiResponseModel>(
      `${this.#cartApiUrl}/items/${cartItemId}`,
      { context: authContext() },
    );
  }

  mergeCart(items: MergeCartItemDto[]): Observable<CartApiResponseModel> {
    return this.#http.post<CartApiResponseModel>(
      `${this.#cartApiUrl}/merge`,
      { items },
      { context: authContext() },
    );
  }
}
