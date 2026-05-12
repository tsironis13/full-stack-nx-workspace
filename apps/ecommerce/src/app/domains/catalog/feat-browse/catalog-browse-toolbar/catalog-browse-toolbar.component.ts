import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { CatalogSort } from '../../application/public-api';

@Component({
  selector: 'app-catalog-browse-toolbar',
  templateUrl: './catalog-browse-toolbar.component.html',
  styleUrl: './catalog-browse-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class CatalogBrowseToolbarComponent {
  readonly sort = input.required<CatalogSort>();
  readonly sortOptions = input.required<{ value: CatalogSort; label: string }[]>();

  readonly searchApplied = output<string>();
  readonly sortChanged = output<CatalogSort>();

  protected readonly searchDraft = signal('');

  protected onApply(): void {
    this.searchApplied.emit(this.searchDraft().trim());
  }
}
