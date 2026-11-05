import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import type { ApexOptions } from 'apexcharts';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { Theme } from '@core/services/theme';
import { Chart } from '@shared/components/chart/chart';
import { chartTokens, withChartDefaults } from '@shared/components/chart/chart-theme';
import { KpiCard, KpiTone } from '@shared/components/kpi-card/kpi-card';
import { TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

interface Kpi {
  label: TranslationKey;
  value: string;
  icon: TablerIconName;
  tone: KpiTone;
  trend: number;
}

// --- Sample data: replace it with your API ---
/** Revenue per month in thousands of MXN, January to October. */
const REVENUE_THIS_YEAR = [82, 91, 88, 102, 97, 110, 118, 115, 124, 128.5];
const REVENUE_LAST_YEAR = [70, 74, 80, 85, 83, 90, 95, 99, 101, 108];
/** Sales by category this month, thousands of MXN. */
const CATEGORY_SALES: { label: TranslationKey; value: number }[] = [
  { label: 'dashboard.category.electronics', value: 42.3 },
  { label: 'dashboard.category.home', value: 31.8 },
  { label: 'dashboard.category.fashion', value: 24.6 },
  { label: 'dashboard.category.beauty', value: 17.2 },
  { label: 'dashboard.category.sports', value: 12.5 },
];
/** Orders this month by weekday, Monday first (adds up to the 1,284 in the KPI). */
const ORDERS_BY_WEEKDAY = [182, 205, 198, 221, 264, 152, 62];
/** Orders per channel, May to October. */
const ORDERS_BY_CHANNEL: { label: TranslationKey; data: number[] }[] = [
  { label: 'dashboard.channel.web', data: [520, 560, 610, 590, 640, 680] },
  { label: 'dashboard.channel.app', data: [310, 340, 360, 400, 420, 470] },
  { label: 'dashboard.channel.store', data: [180, 170, 190, 160, 175, 134] },
];

@Component({
  selector: 'app-dashboard',
  imports: [KpiCard, Chart, TranslatePipe],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly theme = inject(Theme);
  private readonly i18n = inject(I18n);

  protected readonly kpis: Kpi[] = [
    { label: 'dashboard.kpi.sales', value: '$128,450', icon: 'currency-dollar', tone: 'primary', trend: 12.5 },
    { label: 'dashboard.kpi.orders', value: '1,284', icon: 'orders', tone: 'info', trend: 8.2 },
    { label: 'dashboard.kpi.customers', value: '342', icon: 'users', tone: 'warning', trend: -3.1 },
    { label: 'dashboard.kpi.ticket', value: '$1,020', icon: 'credit-card', tone: 'success', trend: 4.6 },
  ];

  private readonly locale = computed(() => (this.i18n.language() === 'en' ? 'en-US' : 'es-MX'));

  private monthNames(fromMonth: number, count: number): string[] {
    const format = new Intl.DateTimeFormat(this.locale(), { month: 'short' });
    return Array.from({ length: count }, (_, index) => {
      const name = format.format(new Date(2026, fromMonth + index, 1)).replace('.', '');
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  }

  private money(thousands: number): string {
    return new Intl.NumberFormat(this.locale(), { style: 'currency', currency: 'MXN', maximumFractionDigits: 1, notation: 'compact' })
      .format(thousands * 1000)
      .replace('MX', '');
  }

  private number(value: number): string {
    return new Intl.NumberFormat(this.locale()).format(value);
  }

  /** Emphasis: this year in the accent hue with a light wash, last year in gray as context. */
  protected readonly revenueChart = computed<ApexOptions>(() => {
    const t = chartTokens(this.theme.isDark());
    return withChartDefaults(this.theme.isDark(), {
      chart: { type: 'line', height: 300 },
      series: [
        { name: this.i18n.t('dashboard.chart.thisYear'), type: 'area', data: REVENUE_THIS_YEAR },
        { name: this.i18n.t('dashboard.chart.lastYear'), type: 'line', data: REVENUE_LAST_YEAR },
      ],
      colors: [t.series[0], t.muted],
      stroke: { width: [2, 2], curve: 'smooth', lineCap: 'round' },
      fill: { type: ['gradient', 'solid'], gradient: { shadeIntensity: 0, opacityFrom: 0.18, opacityTo: 0.02, stops: [0, 100] } },
      markers: { size: 0, strokeColors: t.surface, strokeWidth: 2, hover: { size: 5 } },
      xaxis: { categories: this.monthNames(0, REVENUE_THIS_YEAR.length), crosshairs: { stroke: { color: t.grid, width: 1, dashArray: 0 } } },
      yaxis: { labels: { formatter: (value: number) => this.money(value) } },
      tooltip: { shared: true, intersect: false, y: { formatter: (value: number) => this.money(value) } },
    });
  });

  /** Part-to-whole compared across parts: ranked bars, largest first, one hue. */
  protected readonly categoryChart = computed<ApexOptions>(() => {
    const t = chartTokens(this.theme.isDark());
    const sorted = [...CATEGORY_SALES].sort((a, b) => b.value - a.value);
    return withChartDefaults(this.theme.isDark(), {
      chart: { type: 'bar', height: 300 },
      series: [{ name: this.i18n.t('dashboard.chart.sales'), data: sorted.map((item) => item.value) }],
      colors: [t.series[0]],
      plotOptions: { bar: { horizontal: true, barHeight: '45%', borderRadius: 4, borderRadiusApplication: 'end' } },
      xaxis: {
        categories: sorted.map((item) => this.i18n.t(item.label)),
        labels: { formatter: (value: string) => this.money(Number(value)) },
      },
      yaxis: { labels: { style: { fontSize: '12px', colors: t.text } } },
      grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
      tooltip: { y: { formatter: (value: number) => this.money(value) } },
    });
  });

  /** Magnitude by weekday: one series, one hue. */
  protected readonly weekdayChart = computed<ApexOptions>(() => {
    const t = chartTokens(this.theme.isDark());
    const format = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    // 2026-11-02 is a Monday.
    const days = Array.from({ length: 7 }, (_, index) => {
      const name = format.format(new Date(2026, 10, 2 + index)).replace('.', '');
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
    return withChartDefaults(this.theme.isDark(), {
      chart: { type: 'bar', height: 260 },
      series: [{ name: this.i18n.t('dashboard.chart.orders'), data: ORDERS_BY_WEEKDAY }],
      colors: [t.series[0]],
      plotOptions: { bar: { columnWidth: '40%', borderRadius: 4, borderRadiusApplication: 'end' } },
      xaxis: { categories: days },
      yaxis: { labels: { formatter: (value: number) => this.number(value) } },
      tooltip: { y: { formatter: (value: number) => this.number(value) } },
    });
  });

  /** Distinct series: three channels stacked, separated by a 2px surface gap. */
  protected readonly channelChart = computed<ApexOptions>(() => {
    const t = chartTokens(this.theme.isDark());
    return withChartDefaults(this.theme.isDark(), {
      chart: { type: 'bar', height: 260, stacked: true },
      series: ORDERS_BY_CHANNEL.map((channel) => ({ name: this.i18n.t(channel.label), data: channel.data })),
      plotOptions: { bar: { columnWidth: '40%', borderRadius: 4, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } },
      stroke: { show: true, width: 2, colors: [t.surface] },
      xaxis: { categories: this.monthNames(4, 6) },
      yaxis: { labels: { formatter: (value: number) => this.number(value) } },
      tooltip: { shared: true, intersect: false, y: { formatter: (value: number) => this.number(value) } },
    });
  });
}