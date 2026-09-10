export const UI_THEMES = ['light', 'dark'] as const;

export type UiTheme = (typeof UI_THEMES)[number];

export const DEFAULT_UI_THEME: UiTheme = 'light';

export const UI_THEME_STORAGE_KEY = 'ecommerce.uiTheme';

export const ECOMMERCE_APP_DARK_CLASS = 'ecommerce-app-dark';

export function isUiTheme(value: unknown): value is UiTheme {
  return value === 'light' || value === 'dark';
}

export function parseUiTheme(value: unknown): UiTheme {
  return isUiTheme(value) ? value : DEFAULT_UI_THEME;
}

export function applyUiThemeToDocument(
  root: Pick<HTMLElement, 'classList' | 'style'>,
  theme: UiTheme,
): void {
  root.classList.toggle(ECOMMERCE_APP_DARK_CLASS, theme === 'dark');
  root.style.colorScheme = theme;
}

/** Reads JSON the same way as LocalStorageFacade; used for pre-Angular first paint. */
export function applyStoredUiThemeToDocument(
  getItem: (key: string) => string | null,
  root: Pick<HTMLElement, 'classList' | 'style'>,
): UiTheme {
  let parsed: unknown = null;
  try {
    const raw = getItem(UI_THEME_STORAGE_KEY);
    if (raw !== null) {
      parsed = JSON.parse(raw);
    }
  } catch {
    parsed = null;
  }
  const theme = parseUiTheme(parsed);
  applyUiThemeToDocument(root, theme);
  return theme;
}
