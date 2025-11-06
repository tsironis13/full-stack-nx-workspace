import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ImageComponent } from '../image/image.component';
import { CardViewModel } from './card.view.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImageComponent],
})
export class CardComponent {
  public readonly card = input.required<CardViewModel>();
}
