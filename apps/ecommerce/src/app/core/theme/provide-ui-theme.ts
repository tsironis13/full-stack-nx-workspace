import { inject, provideEnvironmentInitializer } from '@angular/core';

import { UiThemeService } from './ui-theme.service';

/** Eagerly apply the stored UI Theme, including routes without Header (e.g. login). */
export function provideUiTheme() {
  return provideEnvironmentInitializer(() => {
    inject(UiThemeService);
  });
}
