import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';

import type { UiLanguage } from './ui-language';

@Service()
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly _http = inject(HttpClient);

  getTranslation(lang: UiLanguage) {
    return this._http.get<Translation>(`./assets/i18n/${lang}.json`);
  }
}
