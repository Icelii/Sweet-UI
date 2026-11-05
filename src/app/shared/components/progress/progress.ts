import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressTone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
/** Where the percentage shows: nowhere, on the label row, or inside the bar (forces size `lg`). */
export type ProgressValuePosition = 'none' | 'top' | 'inside';

function percentOf(value: number | null | undefined, max: number): number {
  if (value == null || !max) return 0;
  return Math.round(Math.min(Math.max(value / max, 0), 1) * 100);
}

/**
 * Accessible progress bar. Leave `value` as `null` for an indeterminate bar.
 * ```html
 * <app-progress [value]="64" label="Uploading" valuePosition="top" tone="success" />
 * ```
 */
@Component({
  selector: 'app-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block min-w-0',
    role: 'progressbar',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'indeterminate() ? null : 100',
    '[attr.aria-valuenow]': 'indeterminate() ? null : percent()',
    '[attr.aria-label]': 'label() || null',
  },
  template: `
    @if ((label() && !hideLabel()) || valuePosition() === 'top') {
      <div class="flex items-center justify-between gap-3 mb-1.5 text-[13px]">
        <span class="font-medium text-(--text-color) truncate">{{ hideLabel() ? '' : label() }}</span>
        @if (valuePosition() === 'top' && !indeterminate()) {
          <span class="text-(--secondary-text) tabular-nums shrink-0">{{ percent() }}%</span>
        }
      </div>
    }
    <div [class]="classes()">
      <div class="ui-progress-bar" [style.width.%]="indeterminate() ? null : percent()">
        @if (valuePosition() === 'inside' && !indeterminate() && percent() >= 8) {
          <span class="tabular-nums">{{ percent() }}%</span>
        }
      </div>
    </div>
  `,
})
export class Progress {
  readonly value = input<number | null>(null);
  readonly max = input(100);
  readonly tone = input<ProgressTone>('primary');
  readonly size = input<ProgressSize>('md');
  readonly label = input<string>();
  /** Keeps `label` for screen readers only. */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly valuePosition = input<ProgressValuePosition>('none');
  readonly striped = input(false, { transform: booleanAttribute });
  readonly animated = input(false, { transform: booleanAttribute });

  protected readonly indeterminate = computed(() => this.value() == null);
  protected readonly percent = computed(() => percentOf(this.value(), this.max()));

  protected readonly classes = computed(() =>
    [
      'ui-progress',
      `ui-progress-${this.tone()}`,
      `ui-progress-${this.valuePosition() === 'inside' ? 'lg' : this.size()}`,
      this.striped() || this.animated() ? 'ui-progress-striped' : '',
      this.animated() ? 'ui-progress-animated' : '',
      this.indeterminate() ? 'ui-progress-indeterminate' : '',
    ].join(' '),
  );
}

/**
 * Circular progress. Content inside the tag replaces the default percentage in the center.
 * ```html
 * <app-progress-ring [value]="72" [size]="96" tone="success" />
 * ```
 */
@Component({
  selector: 'app-progress-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'indeterminate() ? null : 100',
    '[attr.aria-valuenow]': 'indeterminate() ? null : percent()',
    '[attr.aria-label]': 'label() || null',
    '[class]': 'classes()',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" [attr.viewBox]="'0 0 ' + size() + ' ' + size()" aria-hidden="true">
      <circle class="ui-progress-ring-track" fill="none" [attr.cx]="center()" [attr.cy]="center()" [attr.r]="radius()" [attr.stroke-width]="stroke()" />
      <circle
        class="ui-progress-ring-bar"
        fill="none"
        stroke-linecap="round"
        [attr.cx]="center()"
        [attr.cy]="center()"
        [attr.r]="radius()"
        [attr.stroke-width]="stroke()"
        [attr.stroke-dasharray]="circumference()"
        [attr.stroke-dashoffset]="offset()"
      />
    </svg>
    <span class="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
      <ng-content>
        @if (!indeterminate()) {
          <span class="font-bold text-(--text-color) tabular-nums" [style.font-size.px]="size() * 0.22">{{ percent() }}%</span>
        }
      </ng-content>
    </span>
  `,
})
export class ProgressRing {
  readonly value = input<number | null>(null);
  readonly max = input(100);
  readonly tone = input<ProgressTone>('primary');
  /** Diameter in px. */
  readonly size = input(64);
  readonly stroke = input(6);
  readonly label = input<string>();

  protected readonly indeterminate = computed(() => this.value() == null);
  protected readonly percent = computed(() => percentOf(this.value(), this.max()));
  protected readonly center = computed(() => this.size() / 2);
  protected readonly radius = computed(() => (this.size() - this.stroke()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly offset = computed(() => {
    const visible = this.indeterminate() ? 25 : this.percent();
    return this.circumference() * (1 - visible / 100);
  });

  protected readonly classes = computed(() =>
    ['ui-progress-ring', `ui-progress-${this.tone()}`, this.indeterminate() ? 'ui-progress-ring-indeterminate' : ''].join(' '),
  );
}