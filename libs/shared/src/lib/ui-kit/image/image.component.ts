import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { ImageViewModel } from './image.view.model';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
})
export class ImageComponent {
  public readonly image = input.required<ImageViewModel>();
}
