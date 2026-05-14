import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { MessageModule } from 'primeng/message';

import { AuthStore } from '@full-stack-nx-workspace/auth-web';

import { CheckoutStore } from '../application/public-api';

function formatEur(amount: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FluidModule,
    MessageModule,
  ],
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(CheckoutStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    guestEmail: this.fb.control('', { validators: [Validators.email] }),
    shippingAddress: this.fb.group({
      fullName: ['', Validators.required],
      streetAddress: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      phone: ['', Validators.required],
    }),
    payment: this.fb.group({
      cardNumber: [''],
      expiry: [''],
      cvv: [''],
    }),
  });

  protected readonly isAuthenticated = this.authStore.isAuthenticated;
  protected readonly cartItems = this.store.cartItems;
  protected readonly cartSubtotal = this.store.cartSubtotal;
  protected readonly isSubmitting = this.store.isSubmitting;
  protected readonly error = this.store.error;
  protected readonly status = this.store.status;

  private readonly shippingGroup = this.form.get('shippingAddress');
  private readonly guestEmailCtrl = this.form.get('guestEmail');

  private readonly shippingStatus = toSignal(
    this.shippingGroup?.statusChanges ?? EMPTY,
    { initialValue: this.shippingGroup?.status ?? 'VALID' },
  );
  private readonly guestEmailStatus = toSignal(
    this.guestEmailCtrl?.statusChanges ?? EMPTY,
    { initialValue: this.guestEmailCtrl?.status ?? 'VALID' },
  );

  protected readonly isPlaceOrderDisabled = computed(() => {
    if (this.store.isSubmitting()) return true;
    if (this.store.cartItems().length === 0) return true;
    if (this.shippingStatus() === 'INVALID') return true;
    if (!this.authStore.isAuthenticated() && this.guestEmailStatus() === 'INVALID') {
      return true;
    }
    return false;
  });

  constructor() {
    effect(() => {
      const ctrl = this.guestEmailCtrl;
      if (!ctrl) return;
      if (!this.authStore.isAuthenticated()) {
        ctrl.addValidators(Validators.required);
      } else {
        ctrl.removeValidators(Validators.required);
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      if (this.store.isSuccess()) {
        this.router.navigate(['/checkout', 'confirmation']);
      }
    });
  }

  ngOnInit(): void {
    this.store.resetStatus();
  }

  ngOnDestroy(): void {
    if (!this.store.isSuccess()) {
      this.store.resetStatus();
    }
  }

  protected formatEur(amount: number): string {
    return formatEur(amount);
  }

  protected lineSubtotal(
    salePrice: number | null,
    originalPrice: number | null,
    quantity: number,
  ): string {
    return formatEur((salePrice ?? originalPrice ?? 0) * quantity);
  }

  protected onSubmit(): void {
    const shippingGroup = this.shippingGroup;
    const guestCtrl = this.guestEmailCtrl;

    if (
      !shippingGroup ||
      shippingGroup.invalid ||
      this.store.cartItems().length === 0 ||
      this.store.isSubmitting()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.authStore.isAuthenticated() && guestCtrl?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const sa = shippingGroup.value as {
      fullName: string;
      streetAddress: string;
      addressLine2: string;
      city: string;
      postalCode: string;
      country: string;
      phone: string;
    };

    this.store.placeOrder({
      guestEmail:
        !this.authStore.isAuthenticated() && guestCtrl?.value
          ? guestCtrl.value
          : undefined,
      shippingAddress: {
        fullName: sa.fullName,
        streetAddress: sa.streetAddress,
        ...(sa.addressLine2 ? { addressLine2: sa.addressLine2 } : {}),
        city: sa.city,
        postalCode: sa.postalCode,
        country: sa.country,
        phone: sa.phone,
      },
    });
  }
}
