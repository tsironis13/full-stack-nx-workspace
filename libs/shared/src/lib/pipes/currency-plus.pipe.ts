import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'currencyPlus',
})
export class CurrencyPlusPipe implements PipeTransform {
  readonly #currencyPipe = inject(CurrencyPipe);

  transform(
    value: number,
    currencyCode = 'EUR',
    digitsInfo = '1.0-2',
    locale = 'en-US'
  ): string | null {
    const formatted = this.#currencyPipe.transform(
      value,
      currencyCode,
      'symbol',
      digitsInfo,
      locale
    );

    if (!formatted) return null;

    return formatted
      .replace(/\s+/, '')
      .replace(currencyCode === 'EUR' ? '€' : '', '+€');
  }
}
