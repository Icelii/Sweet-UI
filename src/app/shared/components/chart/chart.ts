import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import type ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

/**
 * Thin ApexCharts wrapper. The library is loaded only in the browser (it needs the DOM),
 * so server rendering keeps working. Changing `options` updates the chart in place.
 *
 * <app-chart [options]="revenueChart()" />
 */
@Component({
  selector: 'app-chart',
  template: `<div #canvas class="w-full"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
})
export class Chart {
  readonly options = input.required<ApexOptions>();

  private readonly canvas = viewChild.required<ElementRef<HTMLDivElement>>('canvas');
  private chart: ApexCharts | null = null;
  private destroyed = false;

  constructor() {
    afterNextRender(async () => {
      const { default: ApexChartsLib } = await import('apexcharts');
      if (this.destroyed) return;
      this.chart = new ApexChartsLib(this.canvas().nativeElement, this.options());
      await this.chart.render();
    });

    // Theme, language or data changes arrive as new options.
    effect(() => {
      const options = this.options();
      this.chart?.updateOptions(options, false, true);
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.chart?.destroy();
      this.chart = null;
    });
  }
}