import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { ConvertProductItemResultWire } from './product-item-conversion-api.model';

@Injectable({ providedIn: 'root' })
export class ProductItemConversionApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/product-items/conversion';

  convert(productId: number): Observable<ConvertProductItemResultWire> {
    const params = new HttpParams().set('productId', String(productId));
    return this.http.get<ConvertProductItemResultWire>(this.url, { params });
  }
}
