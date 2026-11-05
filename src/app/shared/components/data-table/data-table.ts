import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  Directive,
  inject,
  input,
  model,
  numberAttribute,
  TemplateRef,
} from '@angular/core';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

export interface TableColumn {
  /** Property shown by default, and the name used by `appCell` templates. */
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  /** Extra classes for the header and cells of this column, e.g. a width. */
  class?: string;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableRowContext<T> {
  $implicit: T;
  index: number;
}

/** Custom content for one column: `<ng-template appCell="status" let-row>…</ng-template>`. */
@Directive({ selector: 'ng-template[appCell]' })
export class TableCell {
  readonly name = input.required<string>({ alias: 'appCell' });
  readonly template = inject<TemplateRef<TableRowContext<unknown>>>(TemplateRef);
}

/** How each row looks on phones: `<ng-template appTableCard let-row>…</ng-template>`. Optional. */
@Directive({ selector: 'ng-template[appTableCard]' })
export class TableCard {
  readonly template = inject<TemplateRef<TableRowContext<unknown>>>(TemplateRef);
}

/** What to show when there are no rows: `<ng-template appTableEmpty>…</ng-template>`. Optional. */
@Directive({ selector: 'ng-template[appTableEmpty]' })
export class TableEmpty {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

const ALIGN: Record<NonNullable<TableColumn['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const SKELETON_WIDTHS = ['w-20', 'w-36', 'w-14', 'w-28', 'w-24', 'w-10'];

/**
 * Data table with column config, custom cells, sorting, loading skeleton, empty state
 * and an optional card layout for phones. Data handling (filtering, sorting, paging)
 * stays in the page, so it works the same with local data or an API.
 *
 * ```html
 * <app-data-table [rows]="rows()" [columns]="columns" [trackBy]="byId" [(sort)]="sort" [loading]="loading()">
 *   <ng-template appCell="status" let-row>…</ng-template>
 *   <ng-template appTableCard let-row>…</ng-template>
 *   <ng-template appTableEmpty>…</ng-template>
 * </app-data-table>
 * <app-pagination [(page)]="page" [total]="total()" />
 * ```
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, TablerIcon, TranslatePipe],
  templateUrl: './data-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class DataTable<T> {
  readonly rows = input.required<readonly T[]>();
  readonly columns = input.required<readonly TableColumn[]>();
  /** Stable identity per row, e.g. `(row) => row.id`. */
  readonly trackBy = input<(row: T) => unknown>((row) => row);
  /** Current sort; clicking a sortable header updates it. Sort the rows yourself with it. */
  readonly sort = model<TableSort | null>(null);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly skeletonRows = input(5, { transform: numberAttribute });
  readonly striped = input(false, { transform: booleanAttribute });
  /** The table scrolls sideways below this width instead of squeezing the columns. */
  readonly minWidth = input('640px');
  /** Extra classes per row, e.g. dim a row while it saves. */
  readonly rowClass = input<((row: T) => string) | null>(null);
  /** Accessible name of the table. */
  readonly label = input<string | null>(null);

  private readonly cells = contentChildren(TableCell);
  protected readonly card = contentChild(TableCard);
  protected readonly empty = contentChild(TableEmpty);

  protected readonly cellTemplates = computed(() => new Map(this.cells().map((cell) => [cell.name(), cell.template])));
  protected readonly skeleton = computed(() => Array.from({ length: this.skeletonRows() }));
  protected readonly skeletonWidths = SKELETON_WIDTHS;

  protected align(column: TableColumn): string {
    return ALIGN[column.align ?? 'left'];
  }

  protected value(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  protected toggleSort(column: TableColumn): void {
    if (!column.sortable) return;
    const current = this.sort();
    this.sort.set(
      current?.key === column.key
        ? { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, direction: 'asc' },
    );
  }

  protected ariaSort(column: TableColumn): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable) return null;
    const current = this.sort();
    if (current?.key !== column.key) return 'none';
    return current.direction === 'asc' ? 'ascending' : 'descending';
  }
}
