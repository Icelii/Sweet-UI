import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, model, numberAttribute, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

/** `[from, to]`, always with from ≤ to. */
export type RangeValue = [number, number];

@Component({
  selector: 'app-range-slider',
  imports: [TranslatePipe],
  templateUrl: './range-slider.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RangeSlider), multi: true }],
  host: { class: 'block' },
})
export class RangeSlider implements ControlValueAccessor {
  private readonly i18n = inject(I18n);

  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  /** Smallest distance allowed between both handles. */
  readonly minGap = input(0, { transform: numberAttribute });
  /** Text before/after each value, e.g. "$" or "%". */
  readonly prefix = input('');
  readonly suffix = input('');
  readonly inputId = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly value = model<RangeValue | null>(null);

  private readonly formDisabled = signal(false);
  private onChange: (value: RangeValue) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly from = computed(() => this.value()?.[0] ?? this.min());
  protected readonly to = computed(() => this.value()?.[1] ?? this.max());

  private readonly span = computed(() => Math.max(1, this.max() - this.min()));
  protected readonly fromPercent = computed(() => ((this.from() - this.min()) / this.span()) * 100);
  protected readonly toPercent = computed(() => ((this.to() - this.min()) / this.span()) * 100);
  /** When both handles meet at the end, the lower one must stay on top or it can't be dragged back. */
  protected readonly fromOnTop = computed(() => this.fromPercent() > 50);

  protected position(percent: number): string {
    return `calc(${percent}% + ${9 - percent * 0.18}px)`;
  }

  protected format(value: number): string {
    const number = new Intl.NumberFormat(this.i18n.language() === 'en' ? 'en-US' : 'es-MX').format(value);
    return `${this.prefix()}${number}${this.suffix()}`;
  }

  // --- ControlValueAccessor ---
  writeValue(value: RangeValue | null): void {
    this.value.set(Array.isArray(value) ? [value[0], value[1]] : null);
  }

  registerOnChange(fn: (value: RangeValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // --- Events ---
  protected setFrom(raw: string, element: HTMLInputElement): void {
    const value = Math.min(Number(raw), this.to() - this.minGap());
    element.value = String(value);
    this.commit([value, this.to()]);
  }

  protected setTo(raw: string, element: HTMLInputElement): void {
    const value = Math.max(Number(raw), this.from() + this.minGap());
    element.value = String(value);
    this.commit([this.from(), value]);
  }

  protected touch(): void {
    this.onTouched();
  }

  private commit(value: RangeValue): void {
    this.value.set(value);
    this.onChange(value);
  }
}