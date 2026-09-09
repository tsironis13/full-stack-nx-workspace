import { Service, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';

import {
  DEFAULT_UI_LANGUAGE,
  UI_LANGUAGE_STORAGE_KEY,
  isUiLanguage,
  type UiLanguage,
} from './ui-language';

@Service()
export class UiLanguageService {
  private readonly _transloco = inject(TranslocoService);
  private readonly _storage = inject(LocalStorageFacade);

  readonly language = signal<UiLanguage>(DEFAULT_UI_LANGUAGE);

  constructor() {
    const stored = this._storage.getJson<unknown>(UI_LANGUAGE_STORAGE_KEY);
    const initial = isUiLanguage(stored) ? stored : DEFAULT_UI_LANGUAGE;
    this.language.set(initial);
    this._transloco.setActiveLang(initial);
  }

  setLanguage(lang: UiLanguage): void {
    this.language.set(lang);
    this._transloco.setActiveLang(lang);
    this._storage.setJson(UI_LANGUAGE_STORAGE_KEY, lang);
  }
}
