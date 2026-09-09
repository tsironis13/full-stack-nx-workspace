import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-catalog-min-rating-facet',
  templateUrl: './catalog-min-rating-facet.component.html',
  styleUrl: './catalog-min-rating-facet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe],
})
export class CatalogMinRatingFacetComponent {
  readonly selectedMinRating = input<number | null>(null);

  readonly minRatingSelected = output<number | null>();

  protected readonly options = [4, 3, 2, 1] as const;
}
