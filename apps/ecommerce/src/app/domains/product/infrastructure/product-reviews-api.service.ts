import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { ProductReviewsPageWire } from './product-reviews-api.model';

@Injectable({ providedIn: 'root' })
export class ProductReviewsApiService {
  private readonly http = inject(HttpClient);

  list(
    productId: number,
    params: { page: number; pageSize: number },
  ): Observable<ProductReviewsPageWire> {
    const httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('pageSize', String(params.pageSize));

    return this.http.get<ProductReviewsPageWire>(
      `/api/products/${productId}/reviews`,
      { params: httpParams },
    );
  }
}
