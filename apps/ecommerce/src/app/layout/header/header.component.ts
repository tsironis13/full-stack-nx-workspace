import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ButtonDirective } from '@full-stack-nx-workspace/shared';
import { AuthIfDirective, AuthStore } from '@full-stack-nx-workspace/auth-web';
import { CartAclReadAdapter } from '../../domains/cart/application/anti-corruption-layer';
import {
  UiLanguageService,
  UiThemeService,
  type UiLanguage,
} from '../../core/public-api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [AuthIfDirective, ButtonDirective, RouterLink, TranslocoPipe],
  host: {
    class:
      'flex bg-white dark:bg-gray-900 min-h-20 fixed top-0 left-0 z-50 w-full items-center border-b border-gray-200 dark:border-gray-700',
  },
})
export class HeaderComponent {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  protected readonly cartRead = inject(CartAclReadAdapter);
  protected readonly uiLanguage = inject(UiLanguageService);
  protected readonly uiTheme = inject(UiThemeService);

  /** Emitted when the user clicks the cart icon so the parent shell can open the drawer. */
  readonly cartIconClick = output<void>();

  protected toggleTheme(): void {
    this.uiTheme.setTheme(this.uiTheme.theme() === 'light' ? 'dark' : 'light');
  }

  protected setLanguage(lang: UiLanguage): void {
    this.uiLanguage.setLanguage(lang);
  }

  protected openCartDrawer(): void {
    this.cartIconClick.emit();
  }

  protected logout(): void {
    this.authStore.logout();
    void this.router.navigate(['/login']);
  }
}
