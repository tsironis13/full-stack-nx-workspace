import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { AuthUser } from '../domain/public-api';
import { AuthState, AuthStore } from '../application/public-api';

@Directive({
  selector: '[authIf]',
  exportAs: 'authIf',
})
export class AuthIfDirective {
  public readonly authIf = input.required<string | string[]>();
  public readonly authIfElse = input<TemplateRef<unknown>>();
  public readonly authIfPending = input<TemplateRef<unknown>>();
  public readonly authIfDenied =
    input<(error: unknown) => void | Promise<void>>();
  public readonly authIfAuthorized =
    input<(user: AuthUser) => void | Promise<void>>();

  private readonly authStore = inject(AuthStore);
  private readonly templateRef = inject(
    TemplateRef
  ) as TemplateRef<AuthState | null>;
  private readonly viewContainerRef = inject(ViewContainerRef);

  protected readonly authStateEffect = effect(() => {
    const authUser = this.authStore.authUser();

    this.viewContainerRef.clear();

    if (this.isAuthPending()) {
      return;
    }

    if (!authUser) {
      this.denied();
      return;
    }

    this.isUserAuthorized(authUser);
  });

  static ngTemplateContextGuard(
    dir: AuthIfDirective,
    ctx: unknown
  ): ctx is AuthState {
    return true;
  }

  private isUserAuthorized(authUser: AuthUser): void {
    const conditions: string[] = [];

    const authIf = this.authIf();

    if (!Array.isArray(authIf)) {
      if (authIf.trim()) {
        conditions.push(authIf.trim().toLowerCase());
      } else {
        conditions.push('connected');
      }
    } else {
      conditions.push(...(authIf.map((e) => e.trim().toLowerCase()) || []));
    }

    const meetAnyCondition = conditions.some((condition) => {
      return condition === authUser.role || condition === 'connected';
    });

    if (!conditions.length || meetAnyCondition) {
      this.accepted(authUser);
    } else {
      this.denied();
    }
  }

  private isAuthPending(): boolean {
    const authIfPending = this.authIfPending();

    if (authIfPending && this.authStore.isPending()) {
      this.viewContainerRef.createEmbeddedView(authIfPending);
      return true;
    }

    return false;
  }

  private async denied(error?: unknown): Promise<void> {
    const authIfDenied = this.authIfDenied();
    if (authIfDenied) {
      await authIfDenied(error);
    }

    this.viewContainerRef.clear();
    const authIfElse = this.authIfElse();
    if (authIfElse) {
      this.viewContainerRef.createEmbeddedView(authIfElse);
    }
  }

  private async accepted(authUser: AuthUser): Promise<void> {
    try {
      const authIfAuthorized = this.authIfAuthorized();
      if (authIfAuthorized) {
        await authIfAuthorized(authUser);
      }
      this.viewContainerRef.clear();
      this.viewContainerRef.createEmbeddedView(this.templateRef, null);
    } catch (error) {
      this.denied(error);
    }
  }
}
