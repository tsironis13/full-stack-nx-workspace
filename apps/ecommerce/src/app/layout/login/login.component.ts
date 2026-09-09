import { Component, effect, inject, WritableSignal } from '@angular/core';
import { form, FormField, required, email } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  ButtonDirective,
  CardBodyTemplateDirective,
  CardComponent,
  FieldComponent,
  InputDirective,
} from '@full-stack-nx-workspace/shared';
import { AuthStore } from '@full-stack-nx-workspace/auth-web';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    ButtonDirective,
    CardBodyTemplateDirective,
    CardComponent,
    FieldComponent,
    FormField,
    InputDirective,
    TranslocoPipe,
  ],
})
export class LoginComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly _router = inject(Router);

  protected readonly onSuccessUserLoginEffect = effect(() => {
    const authUser = this.authStore.authUser();

    // email: 'tsiro1@hotmail.com',
    //   password: 'sxtvttio',
    if (authUser) {
      this._router.navigate(['/catalog']);
    }
  });

  protected readonly loginForm = form(
    this.authStore.loginForm as unknown as WritableSignal<{
      email: string;
      password: string;
    }>,
    (schemaPath) => {
      required(schemaPath.email, {
        message: 'login.emailRequired',
      });
      email(schemaPath.email, {
        message: 'login.emailInvalid',
      });
      required(schemaPath.password, {
        message: 'login.passwordRequired',
      });
    },
  );

  protected emailError(): string | undefined {
    const field = this.loginForm.email();
    if (!field.touched()) {
      return undefined;
    }
    return field.errors()[0]?.message;
  }

  protected passwordError(): string | undefined {
    const field = this.loginForm.password();
    if (!field.touched()) {
      return undefined;
    }
    return field.errors()[0]?.message;
  }

  protected login(): void {
    const loginForm = this.authStore.loginForm();
    // this.authStore.loginWithEmailAndPassword({
    //   email: 'tsiro1@hotmail.com',
    //   password: 'sxtvttio',
    // });
    // email: 'test@email.com', password: '123456'
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

    if (loginForm) {
      this.authStore.loginWithEmailAndPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
    }
  }
}
