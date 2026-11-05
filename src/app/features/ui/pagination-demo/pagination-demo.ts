import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { NgxApiPaginator } from '@icelii/ngx-api-paginator';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

type PaginatorStyle = 'rounded' | 'circle' | 'minimal' | 'flat' | 'bordered' | 'shadow';

interface Product {
  id: number;
  category: TranslationKey;
  price: number;
  stock: number;
}

interface Page<T> {
  data: T[];
  total: number;
}

const CATEGORIES: TranslationKey[] = ['ui.accordions.filter.dresses', 'ui.accordions.filter.bags', 'ui.accordions.filter.shoes'];

/** Fake catalog the "API" pages through. */
const PRODUCTS: Product[] = Array.from({ length: 87 }, (_, index) => ({
  id: 1001 + index,
  category: CATEGORIES[index % CATEGORIES.length],
  price: 249 + ((index * 137) % 1750),
  stock: (index * 7) % 23,
}));

@Component({
  selector: 'app-pagination-demo',
  imports: [NgxApiPaginator, TablerIcon, TranslatePipe, DecimalPipe],
  templateUrl: './pagination-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationDemo {
  private readonly i18n = inject(I18n);

  /** Library labels in the current language. */
  protected readonly labels = computed(() => {
    return {
      showing: this.i18n.t('ui.pagination.lib.showing'),
      to: this.i18n.t('ui.pagination.lib.to'),
      of: this.i18n.t('ui.pagination.lib.of'),
      results: this.i18n.t('ui.pagination.lib.results'),
      previous: this.i18n.t('ui.pagination.lib.previous'),
      next: this.i18n.t('ui.pagination.lib.next'),
    };
  });

  // API example
  protected readonly apiPage = signal(1);
  protected readonly apiPerPage = 6;
  protected readonly products = signal<Product[]>(this.slice(1, this.apiPerPage).data);
  protected readonly apiTotal = signal(PRODUCTS.length);
  protected readonly loading = signal(false);

  // Styles
  protected readonly styles: PaginatorStyle[] = ['rounded', 'circle', 'minimal', 'flat', 'bordered', 'shadow'];
  protected readonly stylePages = signal<Record<PaginatorStyle, number>>({ rounded: 1, circle: 3, minimal: 5, flat: 2, bordered: 8, shadow: 12 });

  // Per page
  protected readonly perPageOptions = [10, 25, 50, 100];
  protected readonly perPage = signal(25);
  protected readonly bigPage = signal(1);
  protected readonly bigTotal = 2480;

  // Compact
  protected readonly compactPage = signal(4);

  protected async onApiPage(page: number): Promise<void> {
    this.apiPage.set(page);
    this.loading.set(true);
    const response = await this.fetchProducts(page, this.apiPerPage);
    // Ignore answers for a page the user already left.
    if (this.apiPage() !== page) return;
    this.products.set(response.data);
    this.apiTotal.set(response.total);
    this.loading.set(false);
  }

  protected setStylePage(style: PaginatorStyle, page: number): void {
    this.stylePages.update((pages) => ({ ...pages, [style]: page }));
  }

  protected setPerPage(value: number): void {
    this.perPage.set(value);
    this.bigPage.set(1);
  }

  /** Stands in for an HttpClient call such as GET /api/products?page=2&per_page=6. */
  private fetchProducts(page: number, perPage: number): Promise<Page<Product>> {
    return new Promise((resolve) => setTimeout(() => resolve(this.slice(page, perPage)), 450));
  }

  private slice(page: number, perPage: number): Page<Product> {
    const start = (page - 1) * perPage;
    return { data: PRODUCTS.slice(start, start + perPage), total: PRODUCTS.length };
  }
}