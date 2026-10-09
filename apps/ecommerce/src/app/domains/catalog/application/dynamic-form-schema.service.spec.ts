import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { DynamicFormSchemaService } from './dynamic-form-schema.service';

describe('DynamicFormSchemaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('loads the mock schema the API would return', async () => {
    const schema = await firstValueFrom(
      TestBed.inject(DynamicFormSchemaService).loadCustomOrderRequest(),
    );

    expect(schema.id).toBe('custom-order-request');
    expect(schema.submitLabel).toBe('Submit request');
    expect(schema.sections[0]?.fields[0]?.key).toBe('fullName');
    expect(
      schema.sections
        .flatMap((section) => section.fields)
        .find((field) => field.key === 'deliveryAddress')?.visibleWhen,
    ).toEqual({ key: 'fulfillment', equals: 'delivery' });
  });
});
