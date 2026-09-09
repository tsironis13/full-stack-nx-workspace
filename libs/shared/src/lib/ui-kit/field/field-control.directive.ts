import { Directive, ElementRef, inject } from '@angular/core';

import { FieldComponent } from './field.component';

@Directive({
  selector: '[libFieldControl]',
  host: {
    '[id]': 'hostId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'ariaInvalid()',
  },
})
export class FieldControlDirective {
  private readonly field = inject(FieldComponent, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected hostId(): string {
    return this.field?.resolvedId() ?? this.host.nativeElement.id;
  }

  protected describedBy(): string | null {
    return this.field?.describedBy() ?? null;
  }

  protected ariaInvalid(): string | null {
    if (!this.field?.error()) {
      return null;
    }
    return 'true';
  }
}
