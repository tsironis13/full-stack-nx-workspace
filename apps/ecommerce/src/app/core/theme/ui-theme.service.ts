import { Service, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';
import {
  DEFAULT_UI_THEME,
  UI_THEME_STORAGE_KEY,
  applyUiThemeToDocument,
  parseUiTheme,
  type UiTheme,
} from './ui-theme';

@Service()
export class UiThemeService {
  private readonly _storage = inject(LocalStorageFacade);
  private readonly _document = inject(DOCUMENT);

  readonly theme = signal<UiTheme>(DEFAULT_UI_THEME);

  constructor() {
    const stored = this._storage.getJson<unknown>(UI_THEME_STORAGE_KEY);
    const initial = parseUiTheme(stored);
    this.theme.set(initial);
    applyUiThemeToDocument(this._document.documentElement, initial);
  }

  setTheme(theme: UiTheme): void {
    this.theme.set(theme);
    this._storage.setJson(UI_THEME_STORAGE_KEY, theme);
    applyUiThemeToDocument(this._document.documentElement, theme);
  }
}
