import { importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { DEFAULT_UI_LANGUAGE, UI_LANGUAGES } from './ui-language';
// eslint-disable-next-line boundaries/no-unknown -- locale JSON lives under public/
import el from '../../../../public/assets/i18n/el.json';
// eslint-disable-next-line boundaries/no-unknown -- locale JSON lives under public/
import en from '../../../../public/assets/i18n/en.json';

export function ecommerceTranslocoTestingModule() {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { el, en },
      translocoConfig: {
        availableLangs: [...UI_LANGUAGES],
        defaultLang: DEFAULT_UI_LANGUAGE,
      },
      preloadLangs: true,
    }),
  );
}
