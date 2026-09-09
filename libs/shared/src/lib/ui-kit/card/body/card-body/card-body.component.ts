import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Directive({
  selector: 'ng-template[libCardBodyTitle]',
})
export class CardBodyTitleTemplateDirective {}

@Directive({
  selector: 'ng-template[libCardBodyDescription]',
})
export class CardBodyDescriptionTemplateDirective {}

@Component({
  selector: 'lib-card-body',
  templateUrl: './card-body.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class CardBodyComponent {
  protected readonly cardTitle = contentChild.required(
    CardBodyTitleTemplateDirective,
    {
      read: TemplateRef,
    },
  );
  protected readonly cardDescription = contentChild.required(
    CardBodyDescriptionTemplateDirective,
    {
      read: TemplateRef,
    },
  );
}
