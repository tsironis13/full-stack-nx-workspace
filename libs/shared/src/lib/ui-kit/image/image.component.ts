import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { ImageViewModel } from './image.view.model';

@Component({
  selector: 'lib-image',
  templateUrl: './image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  host: {
    class: 'relative inline-block overflow-hidden rounded-md bg-surface-100',
    '[class.block]': 'image().fill',
    '[class.w-full]': 'image().fill',
  },
})
export class ImageComponent {
  public readonly image = input.required<ImageViewModel>();
}
