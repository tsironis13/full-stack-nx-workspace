import { Directive } from '@angular/core';

import { FieldControlDirective } from '../field/field-control.directive';

@Directive({
  selector: 'input[libInput]',
  hostDirectives: [FieldControlDirective],
  host: {
    class:
      'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
  },
})
export class InputDirective {}
