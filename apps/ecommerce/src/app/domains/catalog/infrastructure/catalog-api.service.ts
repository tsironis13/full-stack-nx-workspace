import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  CatalogCategoryRootsResponseWire,
  CatalogListResponseWire,
  CatalogListSortParam,
} from './catalog-api.model';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/products/catalog';
  private readonly categoryRootsUrl = '/api/products/catalog/category-roots';

  list(params: {
    page: number;
    pageSize: number;
    sort: CatalogListSortParam;
    q?: string;
    categoryRootId?: number;
  }): Observable<CatalogListResponseWire> {
    let httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('pageSize', String(params.pageSize))
      .set('sort', params.sort);
    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (
      params.categoryRootId !== undefined &&
      params.categoryRootId !== null
    ) {
      httpParams = httpParams.set(
        'categoryRootId',
        String(params.categoryRootId)
      );
    }
    return this.http.get<CatalogListResponseWire>(this.url, {
      params: httpParams,
    });
  }

  listCategoryRoots(): Observable<CatalogCategoryRootsResponseWire> {
    return this.http.get<CatalogCategoryRootsResponseWire>(
      this.categoryRootsUrl
    );
  }
}
