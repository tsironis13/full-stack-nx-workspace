import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthIfDirective, AuthStore } from '@full-stack-nx-workspace/auth-web';

import { CartAclReadAdapter } from '../../domains/cart/application/anti-corruption-layer';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthIfDirective, ButtonModule, RouterLink],
  host: {
    class:
      'flex bg-white dark:bg-gray-900 min-h-20 fixed top-0 left-0 z-50 w-full items-center border-b border-gray-200 dark:border-gray-700',
  },
})
export class HeaderComponent {
  protected readonly theme = signal<'light' | 'dark'>('dark');

  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  protected readonly cartRead = inject(CartAclReadAdapter);

  /** Emitted when the user clicks the cart icon so the parent shell can open the drawer. */
  readonly cartIconClick = output<void>();

  readonly onThemeChange = effect(() => {
    document.documentElement.classList.toggle(
      'ecommerce-app-dark',
      this.theme() === 'dark',
    );
  });

  protected toggleTheme(): void {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }

  protected openCartDrawer(): void {
    this.cartIconClick.emit();
  }

  protected logout(): void {
    this.authStore.logout();
    void this.router.navigate(['/login']);
  }
}
