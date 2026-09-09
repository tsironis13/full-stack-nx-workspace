import { Directive } from '@angular/core';

import { FieldControlDirective } from '../field/field-control.directive';

@Directive({
  selector: 'input[libCheckbox]',
  hostDirectives: [FieldControlDirective],
  host: {
    class:
      'size-4 rounded-sm border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
  },
})
export class CheckboxDirective {}
