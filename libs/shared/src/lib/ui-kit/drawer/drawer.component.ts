import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  model,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'lib-drawer',
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
  },
})
export class DrawerComponent {
  public readonly open = model(false);

  private readonly panel = viewChild<ElementRef<HTMLDialogElement>>('panel');
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const panel = this.panel();
      if (!panel) {
        return;
      }
      const dialog = panel.nativeElement;
      const shouldOpen = this.open();
      if (shouldOpen && !dialog.open) {
        this.rememberFocus();
        dialog.showModal();
        if (!dialog.contains(document.activeElement)) {
          dialog.focus();
        }
      } else if (!shouldOpen && dialog.open) {
        dialog.close();
        this.restoreFocus();
      }
    });
  }

  protected onDialogClose(): void {
    if (this.open()) {
      this.open.set(false);
    }
    this.restoreFocus();
  }

  protected onEscape(event: Event): void {
    event.preventDefault();
    this.open.set(false);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.open.set(false);
    }
  }

  private rememberFocus(): void {
    this.returnFocusTo =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }

  private restoreFocus(): void {
    this.returnFocusTo?.focus();
    this.returnFocusTo = null;
  }
}
