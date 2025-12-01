import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
} from '@angular/core';

import { CartIconComponent } from './cart-icon/cart-icon.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CartIconComponent, ButtonModule],
  host: {
    class: 'flex bg-white dark:bg-gray-900 h-20 fixed top-0 left-0 z-50 w-full',
  },
})
export class HeaderComponent {
  protected readonly theme = signal<'light' | 'dark'>('light');

  readonly onThemeChange = effect(() => {
    document.documentElement.classList.toggle(
      'ecommerce-app-dark',
      this.theme() === 'dark'
    );
  });

  public toggleTheme(): void {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }
}
