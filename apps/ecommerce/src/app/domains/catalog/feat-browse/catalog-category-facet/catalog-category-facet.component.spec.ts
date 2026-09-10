import { TestBed } from '@angular/core/testing';

import { ecommerceTranslocoTestingModule } from '../../../../core/public-api';
import { CatalogCategoryFacetComponent } from './catalog-category-facet.component';

describe('CatalogCategoryFacetComponent UI Theme', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatalogCategoryFacetComponent],
      providers: [ecommerceTranslocoTestingModule()],
    });
  });

  it('keeps category chips as custom markup on semantic tokens, not kit buttons', () => {
    const fixture = TestBed.createComponent(CatalogCategoryFacetComponent);
    fixture.componentRef.setInput('roots', [
      { id: 4, name: 'Ηλεκτρονικά' },
      { id: 9, name: 'Έπιπλα' },
    ]);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', null);
    fixture.componentRef.setInput('selectedId', 4);
    fixture.detectChanges();

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('.catalog-browse__chip'),
    ) as HTMLButtonElement[];

    expect(chips.length).toBe(3);
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual([
      'Όλα',
      'Ηλεκτρονικά',
      'Έπιπλα',
    ]);
    for (const chip of chips) {
      expect(chip.hasAttribute('libButton')).toBe(false);
      expect(chip.className).not.toMatch(/\bgray-/);
    }
  });
});
