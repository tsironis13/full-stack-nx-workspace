export const UI_LANGUAGES = ['el', 'en'] as const;

export type UiLanguage = (typeof UI_LANGUAGES)[number];

export const DEFAULT_UI_LANGUAGE: UiLanguage = 'el';

export const UI_LANGUAGE_STORAGE_KEY = 'ecommerce.uiLanguage';

export function isUiLanguage(value: unknown): value is UiLanguage {
  return value === 'el' || value === 'en';
}
