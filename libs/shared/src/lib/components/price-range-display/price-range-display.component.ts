import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CurrencyPlusPipe } from '../../pipes/currency-plus.pipe';

export type PriceRangeDisplayContext = {
  $implicit: { minRange: number; maxRange: number; maxValue: number };
};

@Directive({
  selector: 'ng-template[priceRangeDisplay]',
  standalone: true,
})
export class PriceRangeDisplayTemplateDirective {
  static ngTemplateContextGuard(
    _: PriceRangeDisplayTemplateDirective,
    ctx: unknown
  ): ctx is PriceRangeDisplayContext {
    return true;
  }
}

const CURRENCY_CODE = 'EUR';
const CURRENCY_DIGITS_INFO = '1.0-0';
const CURRENCY_LOCALE = 'el-GR';

@Component({
  selector: 'app-price-range-display',
  templateUrl: './price-range-display.component.html',
  styleUrls: ['./price-range-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  providers: [CurrencyPlusPipe, CurrencyPipe],
})
export class PriceRangeDisplayComponent {
  public readonly minRange = input.required<number>();
  public readonly maxRange = input.required<number>();
  public readonly maxValue = input.required<number>();

  protected maxRangeDisplay = linkedSignal(() => {
    return this.maxRange() === this.maxValue()
      ? this.#currencyPlusPipe.transform(
          this.maxRange(),
          CURRENCY_CODE,
          CURRENCY_DIGITS_INFO,
          CURRENCY_LOCALE
        )
      : this.#currencyPipe.transform(
          this.maxRange(),
          CURRENCY_CODE,
          'symbol',
          CURRENCY_DIGITS_INFO,
          CURRENCY_LOCALE
        );
  });

  readonly #currencyPlusPipe = inject(CurrencyPlusPipe);
  readonly #currencyPipe = inject(CurrencyPipe);
}
