import { isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';

import { TranslocoHttpLoader } from './transloco-http.loader';
import { DEFAULT_UI_LANGUAGE, UI_LANGUAGES } from './ui-language';

export function provideEcommerceI18n() {
  return [
    ...provideTransloco({
      config: {
        availableLangs: [...UI_LANGUAGES],
        defaultLang: DEFAULT_UI_LANGUAGE,
        fallbackLang: DEFAULT_UI_LANGUAGE,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ];
}
