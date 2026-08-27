import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-catalog-min-rating-facet',
  templateUrl: './catalog-min-rating-facet.component.html',
  styleUrl: './catalog-min-rating-facet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogMinRatingFacetComponent {
  readonly selectedMinRating = input<number | null>(null);

  readonly minRatingSelected = output<number | null>();

  protected readonly options: { value: number; label: string }[] = [
    { value: 4, label: '4★ και άνω' },
    { value: 3, label: '3★ και άνω' },
    { value: 2, label: '2★ και άνω' },
    { value: 1, label: '1★ και άνω' },
  ];
}
