import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-spinner',
  templateUrl: './spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center justify-center text-primary',
    role: 'status',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class SpinnerComponent {
  public readonly ariaLabel = input.required<string>();
}
