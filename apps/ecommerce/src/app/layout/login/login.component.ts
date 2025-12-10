import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  WritableSignal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { form, Field, required, email } from '@angular/forms/signals';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { Router } from '@angular/router';

import { AuthStore } from '@full-stack-nx-workspace/auth-web';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, InputTextModule, Field, CardModule, FloatLabel],
})
export class LoginComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly onSuccessUserLoginEffect = effect(() => {
    const authUser = this.authStore.authUser();

    // email: 'tsiro1@hotmail.com',
    //   password: 'sxtvttio',
    if (authUser) {
      this.router.navigate(['/']);
    }
  });

  protected readonly loginForm = form(
    this.authStore.loginForm as WritableSignal<{
      email: string;
      password: string;
    }>,
    (schemaPath) => {
      required(schemaPath.email, { message: 'Email is required' });
      email(schemaPath.email, { message: 'Enter a valid email address' });
      required(schemaPath.password, { message: 'Password is required' });
    }
  );

  protected login(): void {
    const loginForm = this.authStore.loginForm();

    if (loginForm) {
      this.authStore.loginWithEmailAndPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
    }
  }
}
