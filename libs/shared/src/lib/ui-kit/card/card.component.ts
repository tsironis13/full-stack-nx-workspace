import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Directive({
  selector: 'ng-template[cardBody]',
})
export class CardBodyTemplateDirective {}

@Directive({
  selector: 'ng-template[cardHeader]',
})
export class CardHeaderTemplateDirective {}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    class: 'relative w-full',
  },
})
export class CardComponent {
  protected readonly cardHeaderTemplate = contentChild(
    CardHeaderTemplateDirective,
    {
      read: TemplateRef,
    }
  );
  protected readonly cardBodyTemplate = contentChild(
    CardBodyTemplateDirective,
    {
      read: TemplateRef,
    }
  );
}
