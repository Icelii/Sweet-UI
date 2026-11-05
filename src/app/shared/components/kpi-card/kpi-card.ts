import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';

export type KpiTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<KpiTone, string> = {
  primary: 'bg-(--primary-color)/10 text-(--primary-color)',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-(--danger)/10 text-(--danger)',
  info: 'bg-info/15 text-info',
};

/**
 * Metric card: label, big value, optional icon, trend and hint.
 *
 * <app-kpi-card label="Ventas" value="$128,450" icon="currency-dollar" [trend]="12.5" hint="vs. mes anterior" />
 */
@Component({
  selector: 'app-kpi-card',
  imports: [TablerIcon],
  templateUrl: './kpi-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<TablerIconName | null>(null);
  readonly tone = input<KpiTone>('primary');
  /** Percent change; positive shows ↑ in green, negative ↓ in red. */
  readonly trend = input<number | null>(null);
  /** Small text next to the trend, e.g. "vs. last month". */
  readonly hint = input('');

  protected readonly toneClass = computed(() => TONES[this.tone()]);
  protected readonly trendUp = computed(() => (this.trend() ?? 0) >= 0);
  protected readonly trendText = computed(() => {
    const trend = this.trend();
    return trend === null ? '' : `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
  });
}