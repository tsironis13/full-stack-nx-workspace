import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { AuthStore } from '@full-stack-nx-workspace/auth-web';

import { ecommerceTranslocoTestingModule } from '../../../core/public-api';
import { CheckoutStore } from '../application/public-api';
import { CheckoutPageComponent } from './checkout-page.component';

describe('CheckoutPageComponent', () => {
  const isAuthenticated = signal(false);
  const isSubmitting = signal(false);
  const status = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const error = signal<string | null>(null);
  const cartItems = signal(
    [
      {
        quantity: 1,
        productId: 1,
        mainProductItemId: 10,
        name: 'Widget',
        salePrice: 9.99,
        originalPrice: 9.99,
        primaryImageUrl: null,
      },
    ],
  );

  beforeEach(() => {
    isAuthenticated.set(false);
    isSubmitting.set(false);
    status.set('idle');
    error.set(null);

    TestBed.configureTestingModule({
      imports: [CheckoutPageComponent],
      providers: [
        ecommerceTranslocoTestingModule(),
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: isAuthenticated.asReadonly(),
          },
        },
        {
          provide: CheckoutStore,
          useValue: {
            cartItems: cartItems.asReadonly(),
            cartSubtotal: signal(9.99).asReadonly(),
            isSubmitting: isSubmitting.asReadonly(),
            error: error.asReadonly(),
            status: status.asReadonly(),
            isSuccess: signal(false).asReadonly(),
            resetStatus: jest.fn(),
            placeOrder: jest.fn(),
          },
        },
      ],
    });
  });

  function createFixture() {
    const fixture = TestBed.createComponent(CheckoutPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('keeps the guest email field and omits it for a Registered User', () => {
    const guestFixture = createFixture();
    expect(guestFixture.nativeElement.querySelector('#guestEmail')).toBeTruthy();

    isAuthenticated.set(true);
    const registered = TestBed.createComponent(CheckoutPageComponent);
    registered.detectChanges();

    expect(registered.nativeElement.querySelector('#guestEmail')).toBeNull();
    expect(registered.nativeElement.querySelector('#fullName')).toBeTruthy();
  });

  it('associates checkout field errors with their inputs', () => {
    const fixture = createFixture();
    const input = fixture.nativeElement.querySelector(
      '#fullName',
    ) as HTMLInputElement;
    const label = fixture.nativeElement.querySelector(
      'label[for="fullName"]',
    ) as HTMLLabelElement;

    expect(label).toBeTruthy();
    expect(input).toBeTruthy();

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector(
      '#fullName-error',
    ) as HTMLElement;
    expect(alert.getAttribute('role')).toBe('alert');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('disables place-order while submitting and shows a kit error on failure', () => {
    const fixture = createFixture();
    const submit = () =>
      fixture.nativeElement.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement;

    isSubmitting.set(true);
    fixture.detectChanges();

    expect(submit().disabled).toBe(true);
    expect(submit().getAttribute('aria-busy')).toBe('true');

    isSubmitting.set(false);
    status.set('error');
    error.set('errors.generic');
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('lib-inline-message'));
    expect(message).toBeTruthy();
    expect(message.nativeElement.getAttribute('role')).toBe('alert');
    expect(message.nativeElement.textContent).toContain(
      'Παρουσιάστηκε σφάλμα',
    );
  });
});
