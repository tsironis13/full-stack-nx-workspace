import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

import { AuthStore } from '@full-stack-nx-workspace/auth-web';

import { ecommerceTranslocoTestingModule } from '../../core/public-api';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        ecommerceTranslocoTestingModule(),
        {
          provide: AuthStore,
          useValue: {
            authUser: signal(null).asReadonly(),
            loginForm: signal({ email: '', password: '' }),
            loginWithEmailAndPassword: jest.fn(),
          },
        },
        provideRouter([]),
      ],
    });
  });

  it('does not translate validator messages while the component is constructed', () => {
    const transloco = TestBed.inject(TranslocoService);
    const translateSpy = jest.spyOn(transloco, 'translate');

    TestBed.createComponent(LoginComponent);

    expect(translateSpy).not.toHaveBeenCalled();
  });

  it('translates the required email error only after the field is touched', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();

    const emailInput = fixture.nativeElement.querySelector(
      '#login-email',
    ) as HTMLInputElement;
    emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector(
      '[role="alert"]',
    ) as HTMLElement;
    expect(alert.textContent?.trim()).toBe('Το email είναι υποχρεωτικό.');
  });
});
