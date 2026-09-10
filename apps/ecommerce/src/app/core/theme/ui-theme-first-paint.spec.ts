import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  ECOMMERCE_APP_DARK_CLASS,
  UI_THEME_STORAGE_KEY,
  applyStoredUiThemeToDocument,
} from './ui-theme';

describe('UI Theme first paint', () => {
  it('applies a stored dark value to the document root', () => {
    const root = document.createElement('div');

    applyStoredUiThemeToDocument(
      (key) => (key === UI_THEME_STORAGE_KEY ? JSON.stringify('dark') : null),
      root,
    );

    expect(root.classList.contains(ECOMMERCE_APP_DARK_CLASS)).toBe(true);
    expect(root.style.colorScheme).toBe('dark');
  });

  it('uses light when storage is missing', () => {
    const root = document.createElement('div');

    applyStoredUiThemeToDocument(() => null, root);

    expect(root.classList.contains(ECOMMERCE_APP_DARK_CLASS)).toBe(false);
    expect(root.style.colorScheme).toBe('light');
  });

  it('uses light when the stored value is invalid', () => {
    const root = document.createElement('div');

    applyStoredUiThemeToDocument(
      (key) => (key === UI_THEME_STORAGE_KEY ? JSON.stringify('sepia') : null),
      root,
    );

    expect(root.classList.contains(ECOMMERCE_APP_DARK_CLASS)).toBe(false);
    expect(root.style.colorScheme).toBe('light');
  });

  it('runs a blocking script in index.html before Angular', () => {
    const html = readFileSync(
      join(__dirname, '../../../index.html'),
      'utf8',
    );
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
    const script = head.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    expect(script).toBeTruthy();

    const root = {
      classList: { toggle: jest.fn() },
      style: { colorScheme: '' },
    };
    const run = new Function(
      'localStorage',
      'document',
      script as string,
    ) as (
      localStorage: { getItem: (key: string) => string | null },
      document: { documentElement: typeof root },
    ) => void;

    run(
      {
        getItem: (key) =>
          key === UI_THEME_STORAGE_KEY ? JSON.stringify('dark') : null,
      },
      { documentElement: root },
    );

    expect(root.classList.toggle).toHaveBeenCalledWith(
      ECOMMERCE_APP_DARK_CLASS,
      true,
    );
    expect(root.style.colorScheme).toBe('dark');

    root.classList.toggle.mockClear();
    root.style.colorScheme = '';

    run({ getItem: () => null }, { documentElement: root });

    expect(root.classList.toggle).toHaveBeenCalledWith(
      ECOMMERCE_APP_DARK_CLASS,
      false,
    );
    expect(root.style.colorScheme).toBe('light');
  });
});
