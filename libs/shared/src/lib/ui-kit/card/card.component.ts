import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Directive({
  selector: 'ng-template[libCardBody]',
})
export class CardBodyTemplateDirective {}

@Directive({
  selector: 'ng-template[libCardHeader]',
})
export class CardHeaderTemplateDirective {}

@Component({
  selector: 'lib-card',
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    class:
      'relative block w-full overflow-hidden rounded-md border border-border bg-surface text-foreground shadow-sm',
  },
})
export class CardComponent {
  protected readonly cardHeaderTemplate = contentChild(
    CardHeaderTemplateDirective,
    {
      read: TemplateRef,
    },
  );
  protected readonly cardBodyTemplate = contentChild(
    CardBodyTemplateDirective,
    {
      read: TemplateRef,
    },
  );
}
