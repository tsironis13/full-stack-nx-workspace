import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { CatalogListResponse, CatalogSort } from '../domain/public-api';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/products/catalog';

  list(params: {
    page: number;
    pageSize: number;
    sort: CatalogSort;
    q?: string;
  }): Observable<CatalogListResponse> {
    let httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('pageSize', String(params.pageSize))
      .set('sort', params.sort);
    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    return this.http.get<CatalogListResponse>(this.url, { params: httpParams });
  }
}
