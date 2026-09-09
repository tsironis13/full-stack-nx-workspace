import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { ButtonDirective } from '../button/button.directive';
import { SelectDirective } from '../select/select.directive';

export type PaginatorPageChange = {
  page: number;
  pageSize: number;
};

@Component({
  selector: 'lib-paginator',
  templateUrl: './paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, SelectDirective],
  host: {
    class: 'flex items-center justify-center gap-3',
  },
})
export class PaginatorComponent {
  public readonly page = input.required<number>();
  public readonly pageSize = input.required<number>();
  public readonly total = input.required<number>();
  public readonly pageSizeOptions = input.required<number[]>();
  public readonly previousLabel = input.required<string>();
  public readonly nextLabel = input.required<string>();
  public readonly pageSizeLabel = input.required<string>();

  public readonly pageChange = output<PaginatorPageChange>();

  protected readonly lastPage = computed(() => {
    const size = this.pageSize();
    if (size <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.total() / size));
  });

  protected readonly isFirstPage = computed(() => this.page() <= 1);
  protected readonly isLastPage = computed(
    () => this.page() >= this.lastPage(),
  );

  protected goTo(page: number): void {
    const nextPage = Math.min(this.lastPage(), Math.max(1, page));
    if (nextPage === this.page()) {
      return;
    }
    this.pageChange.emit({ page: nextPage, pageSize: this.pageSize() });
  }

  protected onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(value) || value === this.pageSize()) {
      return;
    }
    this.pageChange.emit({ page: 1, pageSize: value });
  }
}
