import { TestBed } from '@angular/core/testing';

import { ecommerceTranslocoTestingModule } from '../../../../core/public-api';
import { CatalogAttributeFacetsComponent } from './catalog-attribute-facets.component';

describe('CatalogAttributeFacetsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatalogAttributeFacetsComponent],
      providers: [ecommerceTranslocoTestingModule()],
    });
  });

  it('uses kit Checkbox for attribute values and stays selectable', () => {
    const fixture = TestBed.createComponent(CatalogAttributeFacetsComponent);
    fixture.componentRef.setInput('facets', [
      {
        attributeId: 7,
        name: 'Color',
        values: [{ valueId: 3, value: 'Red' }],
      },
    ]);
    fixture.componentRef.setInput('selectedFilters', {});
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(checkbox).toBeTruthy();
    expect(checkbox.hasAttribute('libCheckbox')).toBe(true);
    expect(checkbox.checked).toBe(false);

    const emitted: { attributeId: number; valueId: number | null }[] = [];
    fixture.componentInstance.valueChanged.subscribe((change) =>
      emitted.push(change),
    );
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emitted).toEqual([{ attributeId: 7, valueId: 3 }]);
  });
});
