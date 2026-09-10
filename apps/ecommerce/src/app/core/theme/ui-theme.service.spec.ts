import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  AuthApiService,
  AuthStore,
} from '@full-stack-nx-workspace/auth-web';
import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';

import { ecommerceTranslocoTestingModule } from '../i18n/transloco-testing';
import { UI_LANGUAGE_STORAGE_KEY } from '../i18n/ui-language';
import { UiLanguageService } from '../i18n/ui-language.service';
import {
  ECOMMERCE_APP_DARK_CLASS,
  UI_THEME_STORAGE_KEY,
} from './ui-theme';
import { provideUiTheme } from './provide-ui-theme';
import { UiThemeService } from './ui-theme.service';

describe('UiThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(ECOMMERCE_APP_DARK_CLASS);
    document.documentElement.style.colorScheme = '';
    TestBed.configureTestingModule({
      providers: [
        UiThemeService,
        UiLanguageService,
        LocalStorageFacade,
        AuthStore,
        {
          provide: AuthApiService,
          useValue: {
            loginWithEmailAndPassword: jest.fn(),
            getCurrentAuthUser: jest.fn(),
          },
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
        ecommerceTranslocoTestingModule(),
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(ECOMMERCE_APP_DARK_CLASS);
    document.documentElement.style.colorScheme = '';
    TestBed.resetTestingModule();
  });

  function injectTheme(): UiThemeService {
    return TestBed.inject(UiThemeService);
  }

  it('defaults to light when storage is empty', () => {
    const service = injectTheme();

    expect(service.theme()).toBe('light');
    expect(
      document.documentElement.classList.contains(ECOMMERCE_APP_DARK_CLASS),
    ).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('does not follow OS prefers-color-scheme', () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: String(query).includes('dark'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    try {
      const service = injectTheme();

      expect(service.theme()).toBe('light');
      expect(
        document.documentElement.classList.contains(ECOMMERCE_APP_DARK_CLASS),
      ).toBe(false);
    } finally {
      window.matchMedia = matchMedia;
    }
  });

  it('round-trips UI Theme through LocalStorageFacade', () => {
    const service = injectTheme();
    const storage = TestBed.inject(LocalStorageFacade);

    service.setTheme('dark');

    expect(service.theme()).toBe('dark');
    expect(storage.getJson(UI_THEME_STORAGE_KEY)).toBe('dark');
    expect(
      document.documentElement.classList.contains(ECOMMERCE_APP_DARK_CLASS),
    ).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');

    service.setTheme('light');

    expect(service.theme()).toBe('light');
    expect(storage.getJson(UI_THEME_STORAGE_KEY)).toBe('light');
    expect(
      document.documentElement.classList.contains(ECOMMERCE_APP_DARK_CLASS),
    ).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('uses light when the stored value is invalid', () => {
    localStorage.setItem(UI_THEME_STORAGE_KEY, JSON.stringify('sepia'));

    const service = injectTheme();

    expect(service.theme()).toBe('light');
    expect(
      document.documentElement.classList.contains(ECOMMERCE_APP_DARK_CLASS),
    ).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('restores a valid stored dark UI Theme', () => {
    TestBed.inject(LocalStorageFacade).setJson(UI_THEME_STORAGE_KEY, 'dark');

    const service = injectTheme();

    expect(service.theme()).toBe('dark');
    expect(
      document.documentElement.classList.contains(ECOMMERCE_APP_DARK_CLASS),
    ).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('is independent of UI Language', () => {
    const theme = injectTheme();
    const language = TestBed.inject(UiLanguageService);
    const storage = TestBed.inject(LocalStorageFacade);

    expect(language.language()).toBe('el');

    theme.setTheme('dark');

    expect(language.language()).toBe('el');
    expect(storage.getJson(UI_LANGUAGE_STORAGE_KEY)).toBeNull();

    language.setLanguage('en');

    expect(theme.theme()).toBe('dark');
    expect(storage.getJson(UI_THEME_STORAGE_KEY)).toBe('dark');
    expect(storage.getJson(UI_LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('leaves UI Theme unchanged on logout', () => {
    const storage = TestBed.inject(LocalStorageFacade);
    storage.setJson(UI_THEME_STORAGE_KEY, 'dark');

    TestBed.inject(AuthStore).logout();

    expect(storage.getJson(UI_THEME_STORAGE_KEY)).toBe('dark');
  });

  it('applies stored dark UI Theme after logout without constructing Header', () => {
    const storage = TestBed.inject(LocalStorageFacade);
    storage.setJson(UI_THEME_STORAGE_KEY, 'dark');
    TestBed.inject(AuthStore).logout();

    TestBed.resetTestingModule();
    document.documentElement.classList.remove(ECOMMERCE_APP_DARK_CLASS);
    document.documentElement.style.colorScheme = '';

    TestBed.configureTestingModule({
      providers: [
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideUiTheme(),
      ],
    });

    TestBed.inject(LocalStorageFacade);

    expect(
      document.documentElement.classList.contains(ECOMMERCE_APP_DARK_CLASS),
    ).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
