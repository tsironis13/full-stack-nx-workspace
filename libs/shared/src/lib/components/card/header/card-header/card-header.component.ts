import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  input,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { CardHeaderContentTemplateDirective } from '../card-header-content-template.directive';

@Directive({
  selector: 'ng-template[cardHeaderActions]',
})
export class CardActionsTemplateDirective {}

@Component({
  selector: 'app-card-header',
  templateUrl: './card-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class CardHeaderComponent {
  public readonly actionsPlacement = input<'top' | 'bottom' | 'center'>(
    'bottom'
  );
  public readonly actionsPosition = input<'left' | 'right' | 'center'>('right');
  protected readonly cardHeaderContentTemplate = contentChild.required(
    CardHeaderContentTemplateDirective,
    {
      read: TemplateRef,
    }
  );
  protected readonly cardHeaderActions = contentChild(
    CardActionsTemplateDirective,
    {
      read: TemplateRef,
    }
  );
}
