import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ApexOptions } from 'apexcharts';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { Theme } from '@core/services/theme';
import { Chart } from '@shared/components/chart/chart';
import { chartTokens, withChartDefaults } from '@shared/components/chart/chart-theme';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

interface Spark {
  label: TranslationKey;
  value: string;
  trend: number;
  data: number[];
}

// --- Sample data: replace it with your API ---
const SPARKS: Spark[] = [
  { label: 'ui.charts.spark.visits', value: '24.8k', trend: 9.4, data: [12, 14, 13, 17, 16, 19, 18, 22, 21, 24, 23, 26] },
  { label: 'ui.charts.spark.conversion', value: '3.2%', trend: 0.6, data: [2.4, 2.6, 2.5, 2.7, 2.9, 2.8, 3.0, 2.9, 3.1, 3.0, 3.2, 3.2] },
  { label: 'ui.charts.spark.refunds', value: '41', trend: -12.8, data: [62, 58, 60, 55, 57, 50, 52, 48, 47, 45, 43, 41] },
];
/** Payment methods this month, percent of orders. */
const PAYMENTS: { label: TranslationKey; value: number }[] = [
  { label: 'ui.charts.pay.card', value: 58 },
  { label: 'ui.charts.pay.transfer', value: 27 },
  { label: 'ui.charts.pay.cash', value: 15 },
];
/** Percent of the monthly sales goal reached. */
const GOAL = 72;
/** Orders per 3-hour block (rows) and weekday (columns), Monday first. */
const HOURS = ['06–09', '09–12', '12–15', '15–18', '18–21', '21–24'];
const HEAT = [
  [4, 6, 5, 7, 8, 12, 9],
  [18, 21, 19, 22, 25, 30, 14],
  [26, 28, 31, 29, 35, 38, 20],
  [22, 24, 23, 27, 33, 41, 26],
  [30, 34, 32, 36, 44, 47, 31],
  [12, 14, 13, 15, 22, 28, 17],
];

@Component({
  selector: 'app-charts-demo',
  imports: [Chart, TablerIcon, TranslatePipe, RouterLink],
  templateUrl: './charts-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsDemo {
  private readonly theme = inject(Theme);
  private readonly i18n = inject(I18n);

  protected readonly points: { icon: TablerIconName; title: TranslationKey; text: TranslationKey }[] = [
    { icon: 'file-text', title: 'ui.charts.p1.title', text: 'ui.charts.p1.text' },
    { icon: 'bolt', title: 'ui.charts.p2.title', text: 'ui.charts.p2.text' },
    { icon: 'refresh', title: 'ui.charts.p3.title', text: 'ui.charts.p3.text' },
    { icon: 'settings', title: 'ui.charts.p4.title', text: 'ui.charts.p4.text' },
  ];

  protected readonly sparks = SPARKS;
  protected readonly goal = GOAL;

  private readonly locale = computed(() => (this.i18n.language() === 'en' ? 'en-US' : 'es-MX'));

  private weekdays(): string[] {
    const format = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    // 2026-11-02 is a Monday.
    return Array.from({ length: 7 }, (_, index) => {
      const name = format.format(new Date(2026, 10, 2 + index)).replace('.', '');
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  }

  /** Small trend lines without axes, one per tile. */
  protected readonly sparkCharts = computed<ApexOptions[]>(() => {
    const isDark = this.theme.isDark();
    const t = chartTokens(isDark);
    return SPARKS.map((spark) =>
      withChartDefaults(isDark, {
        chart: { type: 'area', height: 56, sparkline: { enabled: true } },
        series: [{ name: this.i18n.t(spark.label), data: spark.data }],
        colors: [t.series[0]],
        stroke: { width: 2, curve: 'smooth', lineCap: 'round' },
        markers: { size: 0 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 0, opacityFrom: 0.2, opacityTo: 0.02, stops: [0, 100] } },
        tooltip: { x: { show: false }, marker: { show: false } },
      }),
    );
  });

  /** Part-to-whole with three parts: a donut with the total in the middle. */
  protected readonly donutChart = computed<ApexOptions>(() => {
    const isDark = this.theme.isDark();
    const t = chartTokens(isDark);
    return withChartDefaults(isDark, {
      chart: { type: 'donut', height: 280 },
      series: PAYMENTS.map((item) => item.value),
      labels: PAYMENTS.map((item) => this.i18n.t(item.label)),
      stroke: { width: 2, colors: [t.surface] },
      legend: { position: 'bottom', horizontalAlign: 'center' },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: { fontSize: '12px', color: t.textMuted, offsetY: 26 },
              value: { fontSize: '22px', fontWeight: 700, color: t.text, offsetY: -14, formatter: (value: string) => `${value}%` },
              total: { show: true, label: this.i18n.t('ui.charts.donutTotal'), color: t.textMuted, formatter: () => '1,284' },
            },
          },
        },
      },
      tooltip: { y: { formatter: (value: number) => `${value}%` } },
    });
  });

  /** A single headline value against a goal. */
  protected readonly radialChart = computed<ApexOptions>(() => {
    const isDark = this.theme.isDark();
    const t = chartTokens(isDark);
    return withChartDefaults(isDark, {
      chart: { type: 'radialBar', height: 260 },
      series: [GOAL],
      labels: [this.i18n.t('ui.charts.goalLabel')],
      colors: [t.series[0]],
      stroke: { lineCap: 'round' },
      plotOptions: {
        radialBar: {
          startAngle: -120,
          endAngle: 120,
          hollow: { size: '68%' },
          track: { background: t.grid, strokeWidth: '100%' },
          dataLabels: {
            name: { fontSize: '12px', color: t.textMuted, offsetY: 24 },
            value: { fontSize: '28px', fontWeight: 700, color: t.text, offsetY: -12, formatter: (value: number) => `${value}%` },
          },
        },
      },
    });
  });

  /** Magnitude on a grid: one hue, lighter means fewer orders. */
  protected readonly heatmapChart = computed<ApexOptions>(() => {
    const isDark = this.theme.isDark();
    const t = chartTokens(isDark);
    const days = this.weekdays();
    const orders = this.i18n.t('ui.charts.orders');
    return withChartDefaults(isDark, {
      chart: { type: 'heatmap', height: 300 },
      series: HOURS.map((hours, row) => ({ name: hours, data: HEAT[row].map((value, col) => ({ x: days[col], y: value })) })).reverse(),
      colors: [t.series[0]],
      stroke: { width: 2, colors: [t.surface] },
      plotOptions: { heatmap: { radius: 4, shadeIntensity: 0.6, enableShades: true } },
      yaxis: { labels: { style: { fontSize: '12px' }, maxWidth: 80 } },
      tooltip: { y: { formatter: (value: number) => `${value} ${orders}` } },
    });
  });
}
