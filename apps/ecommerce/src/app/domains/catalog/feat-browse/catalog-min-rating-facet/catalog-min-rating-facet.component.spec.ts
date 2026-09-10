import { TestBed } from '@angular/core/testing';

import { ecommerceTranslocoTestingModule } from '../../../../core/public-api';
import { CatalogMinRatingFacetComponent } from './catalog-min-rating-facet.component';

describe('CatalogMinRatingFacetComponent UI Theme', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatalogMinRatingFacetComponent],
      providers: [ecommerceTranslocoTestingModule()],
    });
  });

  it('keeps rating chips as custom markup without gray-* or kit buttons', () => {
    const fixture = TestBed.createComponent(CatalogMinRatingFacetComponent);
    fixture.componentRef.setInput('selectedMinRating', 4);
    fixture.detectChanges();

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('.catalog-browse__chip'),
    ) as HTMLButtonElement[];

    expect(chips.length).toBeGreaterThan(1);
    expect(chips[0].hasAttribute('libButton')).toBe(false);
    expect(chips.map((chip) => chip.className).join(' ')).not.toMatch(
      /\bgray-/,
    );
  });
});
