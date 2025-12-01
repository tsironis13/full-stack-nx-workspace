import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  linkedSignal,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import {
  ChangeContext,
  NgxSliderModule,
  Options,
} from '@angular-slider/ngx-slider';
import {
  PriceRangeDisplayContext,
  PriceRangeDisplayTemplateDirective,
} from '../price-range-display/price-range-display.component';
import { NgTemplateOutlet } from '@angular/common';

type PointerType = 'square-pointer' | 'circle-pointer';

@Component({
  selector: 'app-price-range-slider',
  templateUrl: './price-range-slider.component.html',
  styleUrls: ['./price-range-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxSliderModule, NgTemplateOutlet],
})
export class PriceRangeSliderComponent {
  public readonly min = input.required<number>();
  public readonly max = input.required<number>();
  public readonly options = input.required<Options>();
  public readonly pointerType = input<PointerType>('square-pointer');

  public readonly userChangeEnd = output<ChangeContext>();

  protected readonly priceRangeDisplayTemplate = contentChild<
    PriceRangeDisplayTemplateDirective,
    TemplateRef<PriceRangeDisplayContext>
  >(PriceRangeDisplayTemplateDirective, {
    read: TemplateRef<PriceRangeDisplayContext>,
  });

  protected readonly minRangeValue = signal<number>(0);
  protected readonly maxRangeValue = linkedSignal(() => this.max());

  protected onChange(changeContext: ChangeContext): void {
    this.minRangeValue.set(changeContext.value);
    this.maxRangeValue.set(changeContext.highValue ?? 0);
  }
}
