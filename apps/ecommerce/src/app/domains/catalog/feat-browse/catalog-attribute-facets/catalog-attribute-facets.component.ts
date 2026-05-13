import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import type { AttributeFacet } from '../../application/public-api';

export interface FacetValueChange {
  attributeId: number;
  valueId: number | null;
}

@Component({
  selector: 'app-catalog-attribute-facets',
  templateUrl: './catalog-attribute-facets.component.html',
  styleUrl: './catalog-attribute-facets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogAttributeFacetsComponent {
  readonly facets = input.required<AttributeFacet[]>();
  readonly selectedFilters = input.required<Record<number, number>>();

  readonly valueChanged = output<FacetValueChange>();
  readonly filtersCleared = output<void>();

  protected readonly hasActiveFilters = computed(
    () => Object.keys(this.selectedFilters()).length > 0
  );

  protected isSelected(attributeId: number, valueId: number): boolean {
    return this.selectedFilters()[attributeId] === valueId;
  }

  protected onCheckboxChange(
    attributeId: number,
    valueId: number,
    checked: boolean
  ): void {
    this.valueChanged.emit({ attributeId, valueId: checked ? valueId : null });
  }
}
