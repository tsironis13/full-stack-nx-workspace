import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ecommerceTranslocoTestingModule } from '../../../../core/public-api';
import {
  PriceRangeDisplayComponent,
  PriceRangeDisplayTemplateDirective,
  PriceRangeSliderComponent,
} from '../../../../ui/public-api';
import { CatalogPriceBandComponent } from './catalog-price-band.component';

@Component({
  selector: 'app-price-range-slider',
  template: '',
})
class StubPriceRangeSliderComponent {
  readonly min = input(0);
  readonly max = input(0);
  readonly options = input<unknown>(null);
}

describe('CatalogPriceBandComponent UI Theme', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatalogPriceBandComponent],
      providers: [ecommerceTranslocoTestingModule()],
    }).overrideComponent(CatalogPriceBandComponent, {
      remove: {
        imports: [
          PriceRangeSliderComponent,
          PriceRangeDisplayComponent,
          PriceRangeDisplayTemplateDirective,
        ],
      },
      add: { imports: [StubPriceRangeSliderComponent] },
    });
  });

  it('uses kit buttons for price apply and clear', () => {
    const fixture = TestBed.createComponent(CatalogPriceBandComponent);
    fixture.componentRef.setInput('salePriceMin', null);
    fixture.componentRef.setInput('salePriceMax', null);
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.catalog-browse__price-actions button',
      ),
    ) as HTMLButtonElement[];

    expect(buttons).toHaveLength(2);
    expect(buttons[0].hasAttribute('libButton')).toBe(true);
    expect(buttons[1].hasAttribute('libButton')).toBe(true);
    expect(buttons[1].getAttribute('variant')).toBe('secondary');
    expect(buttons.map((button) => button.className).join(' ')).not.toMatch(
      /\bgray-/,
    );
  });
});
