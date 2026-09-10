import {
  booleanAttribute,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'icon';

@Directive({
  selector: 'button[libButton], a[libButton]',
  host: {
    class:
      'inline-flex cursor-pointer items-center justify-center gap-2 font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    '[class.bg-primary]': 'variant() === "primary"',
    '[class.text-primary-foreground]': 'variant() === "primary"',
    '[class.hover:bg-primary-hover]': 'variant() === "primary"',
    '[class.bg-secondary]': 'variant() === "secondary"',
    '[class.text-foreground]':
      'variant() === "secondary" || variant() === "ghost"',
    '[class.border]': 'variant() === "secondary"',
    '[class.border-border]': 'variant() === "secondary"',
    '[class.hover:bg-surface-hover]':
      'variant() === "secondary" || variant() === "ghost"',
    '[class.bg-transparent]': 'variant() === "ghost"',
    '[class.bg-red-700]': 'variant() === "danger"',
    '[class.text-white]': 'variant() === "danger"',
    '[class.hover:bg-red-800]': 'variant() === "danger"',
    '[class.h-8]': 'size() === "sm"',
    '[class.px-3]': 'size() === "sm"',
    '[class.text-xs]': 'size() === "sm"',
    '[class.h-10]': 'size() === "md"',
    '[class.px-4]': 'size() === "md"',
    '[class.text-sm]': 'size() === "md"',
    '[class.size-10]': 'size() === "icon"',
    '[class.p-0]': 'size() === "icon"',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.aria-disabled]': 'anchorDisabled()',
  },
})
export class ButtonDirective {
  public readonly variant = input<ButtonVariant>('primary');
  public readonly size = input<ButtonSize>('md');
  public readonly loading = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private disabledByLoading = false;

  constructor() {
    const el = this.host.nativeElement;
    const guard = (event: Event) => {
      if (!this.loading()) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    el.addEventListener('click', guard, true);
    this.destroyRef.onDestroy(() =>
      el.removeEventListener('click', guard, true)
    );

    effect(() => {
      const loading = this.loading();
      if (!(el instanceof HTMLButtonElement)) {
        return;
      }
      if (loading && !el.disabled) {
        el.disabled = true;
        this.disabledByLoading = true;
      } else if (!loading && this.disabledByLoading) {
        el.disabled = false;
        this.disabledByLoading = false;
      }
    });
  }

  protected anchorDisabled(): string | null {
    const el = this.host.nativeElement;
    if (!(el instanceof HTMLAnchorElement)) {
      return null;
    }
    return this.loading() ? 'true' : null;
  }
}
