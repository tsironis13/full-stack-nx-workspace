import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-catalog-category-facet',
  templateUrl: './catalog-category-facet.component.html',
  styleUrl: './catalog-category-facet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogCategoryFacetComponent {
  readonly roots = input.required<{ id: number; name: string | null }[]>();
  readonly loading = input.required<boolean>();
  readonly error = input<string | null>(null);
  readonly selectedId = input<number | null>(null);

  readonly categorySelected = output<number | null>();
}
