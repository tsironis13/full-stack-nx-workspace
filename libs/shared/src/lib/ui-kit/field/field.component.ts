import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

let nextFieldId = 0;

@Component({
  selector: 'lib-field',
  templateUrl: './field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-1',
  },
})
export class FieldComponent {
  public readonly label = input.required<string>();
  public readonly error = input<string | undefined>(undefined);
  public readonly hint = input<string | undefined>(undefined);
  public readonly controlId = input<string | undefined>(undefined);

  private readonly autoId = `lib-field-${++nextFieldId}`;

  public readonly resolvedId = computed(
    () => this.controlId() ?? this.autoId
  );

  public readonly errorId = computed(() => `${this.resolvedId()}-error`);
  public readonly hintId = computed(() => `${this.resolvedId()}-hint`);

  public readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.error()) {
      ids.push(this.errorId());
    }
    if (this.hint()) {
      ids.push(this.hintId());
    }
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
