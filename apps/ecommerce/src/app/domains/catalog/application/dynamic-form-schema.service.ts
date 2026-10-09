import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { DynamicFormSchema } from '../domain/public-api';
import { DynamicFormApiService } from '../infrastructure/public-api';
import { mapDynamicFormSchemaFromWire } from './dynamic-form.mapper';

@Injectable({ providedIn: 'root' })
export class DynamicFormSchemaService {
  private readonly api = inject(DynamicFormApiService);

  loadCustomOrderRequest(): Observable<DynamicFormSchema> {
    return this.api
      .getCustomOrderRequest()
      .pipe(map(mapDynamicFormSchemaFromWire));
  }
}
