import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type InlineMessageVariant = 'error' | 'warning' | 'info';

@Component({
  selector: 'lib-inline-message',
  templateUrl: './inline-message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block rounded-md border px-3 py-2 text-sm',
    '[class.border-red-700]': 'variant() === "error"',
    '[class.bg-red-50]': 'variant() === "error"',
    '[class.text-red-700]': 'variant() === "error"',
    '[class.border-amber-600]': 'variant() === "warning"',
    '[class.bg-amber-50]': 'variant() === "warning"',
    '[class.text-amber-800]': 'variant() === "warning"',
    '[class.border-border]': 'variant() === "info"',
    '[class.bg-surface-50]': 'variant() === "info"',
    '[class.text-foreground]': 'variant() === "info"',
    '[attr.role]': 'variant() === "error" ? "alert" : "status"',
  },
})
export class InlineMessageComponent {
  public readonly variant = input<InlineMessageVariant>('info');
}
