import { inject, Injectable, signal } from '@angular/core';

import { CatalogApiService } from './catalog-api.service';
import type { CatalogListResponse, CatalogSort } from '../domain/public-api';

@Injectable()
export class CatalogBrowseStore {
  private readonly api = inject(CatalogApiService);

  readonly page = signal(1);
  readonly pageSize = signal(12);
  readonly sort = signal<CatalogSort>('newest');
  readonly searchQuery = signal('');

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<CatalogListResponse | null>(null);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list({
        page: this.page(),
        pageSize: this.pageSize(),
        sort: this.sort(),
        q: this.searchQuery() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.data.set(res);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('catalog.loadError');
          this.loading.set(false);
        },
      });
  }
}
