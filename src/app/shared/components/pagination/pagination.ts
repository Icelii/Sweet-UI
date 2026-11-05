import { ChangeDetectionStrategy, Component, computed, input, model, numberAttribute } from '@angular/core';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

/**
 * Page selector with "Showing 1–10 of 24" and numbered buttons (… for long ranges).
 *
 * <app-pagination [(page)]="page" [total]="items().length" [pageSize]="10" />
 */
@Component({
  selector: 'app-pagination',
  imports: [TablerIcon, TranslatePipe],
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class Pagination {
  /** 1-based current page. */
  readonly page = model(1);
  readonly total = input.required({ transform: numberAttribute });
  readonly pageSize = input(10, { transform: numberAttribute });

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly from = computed(() => (this.total() ? (this.page() - 1) * this.pageSize() + 1 : 0));
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  /** Page numbers to show; `null` is an ellipsis. Always includes first, last and the neighbors of the current page. */
  protected readonly pages = computed<(number | null)[]>(() => {
    const count = this.pageCount();
    const current = this.page();
    if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);

    const pages: (number | null)[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(count - 1, current + 1);
    if (start > 2) pages.push(null);
    for (let page = start; page <= end; page++) pages.push(page);
    if (end < count - 1) pages.push(null);
    pages.push(count);
    return pages;
  });

  protected go(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.pageCount()));
  }
}