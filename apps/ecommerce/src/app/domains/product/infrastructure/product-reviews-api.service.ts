import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { REQUIRES_AUTH } from '../../../core/public-api';
import type {
  EditReviewRequestWire,
  MyReviewWire,
  ProductReviewsPageWire,
  SubmitReviewRequestWire,
} from './product-reviews-api.model';

const authContext = () => new HttpContext().set(REQUIRES_AUTH, true);

@Injectable({ providedIn: 'root' })
export class ProductReviewsApiService {
  private readonly http = inject(HttpClient);

  private base(productId: number): string {
    return `/api/products/${productId}/reviews`;
  }

  list(
    productId: number,
    params: { page: number; pageSize: number },
  ): Observable<ProductReviewsPageWire> {
    const httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('pageSize', String(params.pageSize));

    return this.http.get<ProductReviewsPageWire>(this.base(productId), {
      params: httpParams,
    });
  }

  getMine(productId: number): Observable<MyReviewWire> {
    return this.http.get<MyReviewWire>(`${this.base(productId)}/me`, {
      context: authContext(),
    });
  }

  submit(
    productId: number,
    body: SubmitReviewRequestWire,
  ): Observable<MyReviewWire> {
    return this.http.post<MyReviewWire>(this.base(productId), body, {
      context: authContext(),
    });
  }

  edit(
    productId: number,
    body: EditReviewRequestWire,
  ): Observable<MyReviewWire> {
    return this.http.patch<MyReviewWire>(`${this.base(productId)}/me`, body, {
      context: authContext(),
    });
  }

  remove(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(productId)}/me`, {
      context: authContext(),
    });
  }
}
