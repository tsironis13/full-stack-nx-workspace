import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  imports: [PaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  public readonly totalRecords = input.required<number>();
  public readonly rowsPerPageOptions = input.required<number[]>();

  public readonly changePage = output<{ page: number; limit: number }>();

  protected readonly first = signal<number>(0);
  protected readonly rows = linkedSignal(() => this.rowsPerPageOptions()[0]);

  public onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? this.rowsPerPageOptions()[0]);

    this.changePage.emit({
      page: event.page ? event.page + 1 : 1,
      limit: event.rows ?? this.rowsPerPageOptions()[0],
    });
  }
}
