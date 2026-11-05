import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { DataTable, TableCard, TableCell, TableColumn, TableEmpty, TableSort } from '@shared/components/data-table/data-table';
import { Datepicker, DateRangeValue } from '@shared/components/datepicker/datepicker';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { Modal } from '@shared/components/modal/modal';
import { Pagination } from '@shared/components/pagination/pagination';
import { Select, SelectOption } from '@shared/components/select/select';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { Discount, DiscountScope, DiscountState, discountState, sampleDiscounts, SCOPE_LABELS, STATE_CLASSES, STATE_LABELS } from './discounts-data';


interface RecentOrder {
  id: string;
  customer: string;
  date: Date;
  total: number;
  status: 'paid' | 'pending' | 'refunded';
}

const ORDER_STATUS: Record<RecentOrder['status'], { label: TranslationKey; classes: string }> = {
  paid: { label: 'tables.order.paid', classes: 'bg-success/15 text-[color:color-mix(in_oklab,var(--color-success),var(--text-color)_40%)] border-success/30' },
  pending: { label: 'tables.order.pending', classes: 'bg-warning/15 text-[color:color-mix(in_oklab,var(--color-warning),var(--text-color)_40%)] border-warning/30' },
  refunded: { label: 'tables.order.refunded', classes: 'bg-(--bg-2) text-(--secondary-text) border-(--border-color-1)/60' },
};

/** Lowercase without accents, so "liquidacion" finds "Liquidación". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

@Component({
  selector: 'app-tables-demo',
  imports: [NgTemplateOutlet, ReactiveFormsModule, DataTable, TableCell, TableCard, TableEmpty, Select, Datepicker, Modal, Pagination, ErrorMessages, TablerIcon, TranslatePipe],
  templateUrl: './tables-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesDemo {
  private readonly i18n = inject(I18n);
  private readonly fb = inject(FormBuilder);

  protected readonly scopeLabels = SCOPE_LABELS;
  protected readonly stateLabels = STATE_LABELS;
  protected readonly stateClasses = STATE_CLASSES;
  protected readonly pageSizes = [5, 10, 20];

  // --- Data & UI state ---
  protected readonly discounts = signal<Discount[]>(sampleDiscounts());
  protected readonly loading = signal(false);
  protected readonly busyId = signal<number | null>(null);
  protected readonly showFilters = signal(false);

  protected readonly search = signal('');
  protected readonly scopeFilter = signal<DiscountScope | null>(null);
  protected readonly stateFilter = signal<DiscountState | null>(null);
  protected readonly pageSize = signal(10);
  protected readonly page = signal(1);
  protected readonly sort = signal<TableSort | null>({ key: 'name', direction: 'asc' });
  protected readonly byId = (row: { id: number | string }) => row.id;
  protected readonly dimBusy = (row: Discount) => (this.busyId() === row.id ? 'opacity-50' : '');

  /** Columns of the discounts table; the cells with custom content are `appCell` templates. */
  protected readonly discountColumns = computed<TableColumn[]>(() => {
    this.i18n.language();
    const t = (key: TranslationKey) => this.i18n.t(key);
    return [
      { key: 'state', label: t('tables.col.state'), class: 'w-32' },
      { key: 'name', label: t('tables.col.discount'), sortable: true },
      { key: 'value', label: t('tables.col.value'), sortable: true },
      { key: 'scope', label: t('tables.col.scope') },
      { key: 'to', label: t('tables.col.validity'), sortable: true },
      { key: 'active', label: t('tables.col.active'), align: 'center', class: 'w-20' },
      { key: 'actions', label: t('tables.col.actions'), align: 'right', class: 'w-32' },
    ];
  });

  protected readonly orderColumns = computed<TableColumn[]>(() => {
    this.i18n.language();
    const t = (key: TranslationKey) => this.i18n.t(key);
    return [
      { key: 'id', label: t('tables.order.id') },
      { key: 'customer', label: t('tables.order.customer') },
      { key: 'date', label: t('tables.order.date') },
      { key: 'status', label: t('tables.col.state') },
      { key: 'total', label: t('tables.order.total'), align: 'right' },
    ];
  });

  protected readonly scopeOptions = computed<SelectOption<DiscountScope>[]>(() => {
    this.i18n.language();
    return (Object.keys(SCOPE_LABELS) as DiscountScope[]).map((scope) => ({ value: scope, label: this.i18n.t(SCOPE_LABELS[scope]) }));
  });

  protected readonly stateOptions = computed<SelectOption<DiscountState>[]>(() => {
    this.i18n.language();
    return (Object.keys(STATE_LABELS) as DiscountState[]).map((state) => ({ value: state, label: this.i18n.t(STATE_LABELS[state]) }));
  });

  protected readonly activeFilters = computed(() => Number(!!this.scopeFilter()) + Number(!!this.stateFilter()));

  protected readonly filtered = computed(() => {
    const query = normalize(this.search().trim());
    const scope = this.scopeFilter();
    const state = this.stateFilter();
    const key = this.sort()?.key ?? 'name';
    const direction = this.sort()?.direction === 'desc' ? -1 : 1;

    return this.discounts()
      .filter((discount) => !query || normalize(`${discount.name} ${discount.description} ${discount.target ?? ''}`).includes(query))
      .filter((discount) => !scope || discount.scope === scope)
      .filter((discount) => !state || discountState(discount) === state)
      .sort((a, b) => {
        if (key === 'name') return a.name.localeCompare(b.name, this.i18n.language()) * direction;
        if (key === 'value') return (a.value - b.value) * direction;
        // Discounts without an end date go last.
        const aTo = a.to?.getTime() ?? Infinity;
        const bTo = b.to?.getTime() ?? Infinity;
        return (aTo - bTo) * direction;
      });
  });

  protected readonly visible = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  protected readonly hasQuery = computed(() => !!this.search().trim() || this.activeFilters() > 0);

  // --- Simple table sample ---
  protected readonly recentOrders: RecentOrder[] = [
    { id: '#10482', customer: 'Ana López', date: new Date(2026, 10, 2), total: 1849, status: 'paid' },
    { id: '#10481', customer: 'Carlos Ruiz', date: new Date(2026, 10, 1), total: 529, status: 'pending' },
    { id: '#10480', customer: 'María Fernanda Torres', date: new Date(2026, 9, 31), total: 3120, status: 'paid' },
    { id: '#10479', customer: 'Jorge Méndez', date: new Date(2026, 9, 31), total: 249, status: 'refunded' },
    { id: '#10478', customer: 'Lucía Herrera', date: new Date(2026, 9, 30), total: 980, status: 'paid' },
  ];

  constructor() {
    // Any change in search, filters or page size goes back to page 1.
    effect(() => {
      this.search();
      this.scopeFilter();
      this.stateFilter();
      this.pageSize();
      this.page.set(1);
    });

    // After deleting the last row of the last page, step back to a page that has rows.
    effect(() => {
      const lastPage = Math.max(1, Math.ceil(this.filtered().length / this.pageSize()));
      if (this.page() > lastPage) this.page.set(lastPage);
    });
  }

  // --- Formatting ---
  private get locale(): string {
    return this.i18n.language() === 'en' ? 'en-US' : 'es-MX';
  }

  protected state(discount: Discount): DiscountState {
    return discountState(discount);
  }

  protected orderBadge(order: RecentOrder): { label: TranslationKey; classes: string } {
    return ORDER_STATUS[order.status];
  }

  protected scopeLabel(discount: Discount): TranslationKey {
    return SCOPE_LABELS[discount.scope];
  }

  protected valueLabel(discount: Discount): string {
    if (discount.type === 'PERCENTAGE') return `${discount.value}%`;
    return this.money(discount.value);
  }

  protected money(value: number): string {
    return new Intl.NumberFormat(this.locale, { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value).replace('MX', '');
  }

  protected date(value: Date | null, withTime = false): string {
    if (!value) return '';
    return new Intl.DateTimeFormat(this.locale, withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(value);
  }

  // --- Toolbar ---
  protected refresh(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 700);
  }

  protected clearFilters(): void {
    this.scopeFilter.set(null);
    this.stateFilter.set(null);
    this.search.set('');
  }


  protected toggleActive(discount: Discount): void {
    this.busyId.set(discount.id);
    setTimeout(() => {
      this.discounts.update((list) => list.map((item) => (item.id === discount.id ? { ...item, active: !item.active, updatedAt: new Date() } : item)));
      this.busyId.set(null);
    }, 500);
  }

  // --- Detail modal ---
  protected readonly detail = signal<Discount | null>(null);
  protected readonly detailOpen = signal(false);

  protected openDetail(discount: Discount): void {
    this.detail.set(discount);
    this.detailOpen.set(true);
  }

  protected editFromDetail(): void {
    const discount = this.detail();
    this.detailOpen.set(false);
    if (discount) this.openForm(discount);
  }

  // --- Create / edit modal ---
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Discount | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    description: [''],
    type: ['PERCENTAGE' as Discount['type']],
    value: [null as number | null, [Validators.required, Validators.min(1)]],
    scope: ['ALL' as DiscountScope | null, Validators.required],
    target: [''],
    period: [null as DateRangeValue | null],
    maxUsages: [null as number | null, Validators.min(1)],
    active: [true],
  });

  protected openForm(discount?: Discount): void {
    this.editing.set(discount ?? null);
    this.form.reset({
      name: discount?.name ?? '',
      description: discount?.description ?? '',
      type: discount?.type ?? 'PERCENTAGE',
      value: discount?.value ?? null,
      scope: discount?.scope ?? 'ALL',
      target: discount?.target ?? '',
      period: discount && (discount.since || discount.to) ? { start: discount.since ?? discount.to, end: discount.to } : null,
      maxUsages: discount?.maxUsages ?? null,
      active: discount?.active ?? true,
    });
    this.formOpen.set(true);
  }

  protected save(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const current = this.editing();
    const discount: Discount = {
      id: current?.id ?? Math.max(0, ...this.discounts().map((item) => item.id)) + 1,
      name: value.name.trim(),
      description: value.description.trim(),
      type: value.type,
      value: Math.min(value.value ?? 0, value.type === 'PERCENTAGE' ? 100 : Number.MAX_SAFE_INTEGER),
      scope: value.scope ?? 'ALL',
      target: value.scope === 'ALL' ? null : value.target.trim() || null,
      since: value.period?.start ?? null,
      to: value.period?.end ?? null,
      active: value.active,
      maxUsages: value.maxUsages,
      createdAt: current?.createdAt ?? new Date(),
      updatedAt: current ? new Date() : null,
    };

    this.saving.set(true);
    setTimeout(() => {
      this.discounts.update((list) => (current ? list.map((item) => (item.id === discount.id ? discount : item)) : [discount, ...list]));
      this.saving.set(false);
      this.formOpen.set(false);
    }, 600);
  }

  // --- Delete confirmation ---
  protected readonly toDelete = signal<Discount | null>(null);
  protected readonly deleteOpen = signal(false);
  protected readonly deleting = signal(false);

  protected askDelete(discount: Discount): void {
    this.toDelete.set(discount);
    this.deleteOpen.set(true);
  }

  protected confirmDelete(): void {
    const discount = this.toDelete();
    if (!discount || this.deleting()) return;
    this.deleting.set(true);
    setTimeout(() => {
      this.discounts.update((list) => list.filter((item) => item.id !== discount.id));
      this.deleting.set(false);
      this.deleteOpen.set(false);
    }, 600);
  }
}