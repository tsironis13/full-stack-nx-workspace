import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';

import {
  PriceRangeDisplayComponent,
  PriceRangeDisplayTemplateDirective,
  PriceRangeSliderComponent,
} from '@full-stack-nx-workspace/shared';

const FLOOR = 0;
const CEIL = 10_000;

export interface PriceRange {
  min: number | null;
  max: number | null;
}

@Component({
  selector: 'app-catalog-price-band',
  templateUrl: './catalog-price-band.component.html',
  styleUrl: './catalog-price-band.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PriceRangeDisplayComponent,
    PriceRangeDisplayTemplateDirective,
    PriceRangeSliderComponent,
  ],
})
export class CatalogPriceBandComponent implements OnInit {
  readonly salePriceMin = input<number | null>(null);
  readonly salePriceMax = input<number | null>(null);

  readonly priceRangeChanged = output<PriceRange>();

  readonly sliderOptions: Options = {
    floor: FLOOR,
    ceil: CEIL,
    step: 1,
    enforceRange: true,
  };

  protected readonly sliderLow = signal(FLOOR);
  protected readonly sliderHigh = signal(CEIL);
  protected readonly filterError = signal<string | null>(null);

  ngOnInit(): void {
    this.sliderLow.set(this.salePriceMin() ?? FLOOR);
    this.sliderHigh.set(this.salePriceMax() ?? CEIL);
  }

  protected onSliderChangeEnd(ctx: ChangeContext): void {
    this.sliderLow.set(ctx.value);
    this.sliderHigh.set(ctx.highValue ?? CEIL);
  }

  protected onApply(): void {
    this.filterError.set(null);
    const low = this.sliderLow();
    const high = this.sliderHigh();
    if (low > high) {
      this.filterError.set(
        'Η ελάχιστη τιμή δεν μπορεί να υπερβαίνει τη μέγιστη.'
      );
      return;
    }
    this.priceRangeChanged.emit({
      min: low > FLOOR ? low : null,
      max: high < CEIL ? high : null,
    });
  }

  protected onClear(): void {
    this.filterError.set(null);
    this.sliderLow.set(FLOOR);
    this.sliderHigh.set(CEIL);
    this.priceRangeChanged.emit({ min: null, max: null });
  }
}
