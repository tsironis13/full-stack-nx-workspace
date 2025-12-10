import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';

import { CartIconComponent } from './cart-icon/cart-icon.component';
import { ButtonModule } from 'primeng/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthIfDirective, AuthStore } from '@full-stack-nx-workspace/auth-web';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CartIconComponent, ButtonModule, AuthIfDirective],
  host: {
    class: 'flex bg-white dark:bg-gray-900 h-20 fixed top-0 left-0 z-50 w-full',
  },
})
export class HeaderComponent {
  protected readonly theme = signal<'light' | 'dark'>('light');

  readonly authStore = inject(AuthStore);

  readonly onThemeChange = effect(() => {
    document.documentElement.classList.toggle(
      'ecommerce-app-dark',
      this.theme() === 'dark'
    );
  });

  public toggleTheme(): void {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }

  httpClient = inject(HttpClient);

  private token = signal<string | null>(null);

  public login(): void {
    this.authStore.loginWithEmailAndPassword({
      email: 'tsiro1@hotmail.com',
      password: 'sxtvttio',
    });
    // this.httpClient
    //   .post('/api/auth/login', {
    //     //email: 'giannis123@hotmail.com',
    //     //password: 'fjsfljsjksdffds',
    //     email: 'tsiro1@hotmail.com',
    //     password: 'sxtvttio',
    //   })
    //   .subscribe((data: any) => {
    //     console.log(data?.data?.session?.access_token);
    //     this.token.set(data?.data?.session?.access_token);
    //     //this.token.set(data.access_token);
    //   });
  }

  public myorder(): void {
    const header = new HttpHeaders({
      Authorization: `Bearer ${this.token()}`,
    });

    this.httpClient
      .post('/api/orders/myorder', { id: 1 }, { headers: header })
      .subscribe((data) => {
        console.log(data);
      });

    this.httpClient
      .get('/api/auth/profile', { headers: header })
      .subscribe((data) => {
        console.log(data);
      });
  }
}
