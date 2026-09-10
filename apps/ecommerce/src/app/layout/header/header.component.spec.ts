import { computed, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthStore } from '@full-stack-nx-workspace/auth-web';
import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';

import { CartAclReadAdapter } from '../../domains/cart/application/anti-corruption-layer';
import {
  UI_THEME_STORAGE_KEY,
  UiLanguageService,
  UiThemeService,
  ecommerceTranslocoTestingModule,
} from '../../core/public-api';
import { HeaderComponent } from './header.component';

describe('HeaderComponent UI Theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('ecommerce-app-dark');
    document.documentElement.style.colorScheme = '';
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        ecommerceTranslocoTestingModule(),
        UiThemeService,
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            authUser: signal(null).asReadonly(),
            isPending: signal(false).asReadonly(),
            logout: jest.fn(),
          },
        },
        {
          provide: CartAclReadAdapter,
          useValue: {
            totalUnitCount: computed(() => 0),
          },
        },
        provideRouter([]),
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('ecommerce-app-dark');
    document.documentElement.style.colorScheme = '';
    TestBed.resetTestingModule();
  });

  function themeButton(nativeElement: HTMLElement): HTMLButtonElement {
    const buttons = Array.from(
      nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const match = buttons.find((button) => {
      const label = button.getAttribute('aria-label') ?? '';
      return label.includes('θέμα') || label.toLowerCase().includes('theme');
    });
    if (!match) {
      throw new Error('UI Theme control not found');
    }
    return match;
  }

  it('starts light with a moon icon and the light-theme accessible name', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const button = themeButton(fixture.nativeElement);
    const icon = button.querySelector('i');

    expect(button.tagName).toBe('BUTTON');
    expect(button.tabIndex).not.toBe(-1);
    expect(button.getAttribute('aria-label')).toBe('Εναλλαγή σε σκοτεινό θέμα');
    expect(icon?.classList.contains('pi-moon')).toBe(true);
    expect(icon?.classList.contains('pi-sun')).toBe(false);
  });

  it('shows a sun icon and the dark-theme accessible name when UI Theme is dark', () => {
    TestBed.inject(LocalStorageFacade).setJson(UI_THEME_STORAGE_KEY, 'dark');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const button = themeButton(fixture.nativeElement);
    const icon = button.querySelector('i');

    expect(button.getAttribute('aria-label')).toBe('Εναλλαγή σε φωτεινό θέμα');
    expect(icon?.classList.contains('pi-sun')).toBe(true);
    expect(icon?.classList.contains('pi-moon')).toBe(false);
  });

  it('toggles UI Theme through the service when activated', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const button = themeButton(fixture.nativeElement);
    button.click();
    fixture.detectChanges();

    expect(TestBed.inject(UiThemeService).theme()).toBe('dark');
    expect(button.getAttribute('aria-label')).toBe('Εναλλαγή σε φωτεινό θέμα');
    expect(button.querySelector('i')?.classList.contains('pi-sun')).toBe(true);

    button.click();
    fixture.detectChanges();

    expect(TestBed.inject(UiThemeService).theme()).toBe('light');
  });

  it('names the control in the current UI Language', () => {
    TestBed.inject(UiLanguageService).setLanguage('en');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    expect(themeButton(fixture.nativeElement).getAttribute('aria-label')).toBe(
      'Switch to dark theme',
    );
  });

  it('keeps header auth links readable on the dark header', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const signIn = fixture.nativeElement.querySelector(
      'a[href="/login"]',
    ) as HTMLAnchorElement;

    expect(signIn.classList.contains('text-primary')).toBe(true);
    expect(signIn.classList.contains('dark:text-primary-foreground')).toBe(
      true,
    );
  });

  it('keeps the UI Language switcher as a segmented control on semantic tokens', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector(
      '[role="group"]',
    ) as HTMLElement;
    const chips = group.querySelectorAll('button');

    expect(group.getAttribute('aria-label')).toBe('Γλώσσα');
    expect(chips.length).toBe(2);
    expect(`${group.className} ${chips[0].className}`).not.toMatch(/\bgray-/);
  });
});
