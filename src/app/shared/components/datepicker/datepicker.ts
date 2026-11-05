import { afterNextRender, booleanAttribute, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, forwardRef, inject, Injector, input, model, numberAttribute, OnInit, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { isOwnLabelClick, positionFloating } from '@shared/utils/floating';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { addDays, addMonths, buildMonthGrid, compareDays, isSameDay, isSameMonth, startOfDay, toDate } from './date-utils';

export type DatepickerMode = 'single' | 'range' | 'multiple';
export type DatepickerView = 'days' | 'months' | 'years';

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

export type DatepickerValue = Date | DateRangeValue | Date[] | null;

interface DayCell {
  date: Date;
  key: string;
  day: number;
  outside: boolean;
  disabled: boolean;
  today: boolean;
}

interface MonthPanel {
  key: string;
  date: Date;
  monthLabel: string;
  year: number;
  weeks: DayCell[][];
}

interface RangePreset {
  label: TranslationKey;
  start: Date;
  end: Date;
}

const LOCALES: Record<string, string> = { es: 'es-MX', en: 'en-US' };
const WEEK_START: Record<string, number> = { es: 1, en: 0 };
const YEARS_PER_PAGE = 12;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

@Component({
  selector: 'app-datepicker',
  imports: [TablerIcon, TranslatePipe],
  templateUrl: './datepicker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Datepicker), multi: true }],
  host: {
    class: 'relative block',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Datepicker implements ControlValueAccessor, OnInit {
  private readonly i18n = inject(I18n);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reposition = () => this.placePanel();

  // --- Inputs ---
  /** `single` picks one date, `range` a start/end pair and `multiple` any number of dates. */
  readonly mode = input<DatepickerMode>('single');
  /** Renders the calendar always visible, without the text field. */
  readonly inline = input(false, { transform: booleanAttribute });
  /** Months shown side by side (only on screens ≥ 640px). */
  readonly months = input(1, { transform: numberAttribute });
  /** Adds hour and minute selectors (single mode). */
  readonly showTime = input(false, { transform: booleanAttribute });
  readonly minuteStep = input(5, { transform: numberAttribute });
  /** Quick ranges such as "Last 7 days" (range mode). */
  readonly showPresets = input(false, { transform: booleanAttribute });
  readonly minDate = input<Date | string | null>(null);
  readonly maxDate = input<Date | string | null>(null);
  /** Return `true` to block a day, e.g. weekends or holidays. */
  readonly isDateDisabled = input<((date: Date) => boolean) | null>(null);
  /** 0 = Sunday, 1 = Monday. Defaults to the current language. */
  readonly weekStart = input<number | null>(null);
  readonly placeholder = input<string | null>(null);
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly inputId = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Works with `[(value)]` as well as with reactive forms. */
  readonly value = model<DatepickerValue>(null);

  // --- State ---
  protected readonly open = signal(false);
  protected readonly view = signal<DatepickerView>('days');
  protected readonly viewDate = signal(this.firstOfMonth(new Date()));
  protected readonly focusDate = signal(startOfDay(new Date()));
  protected readonly hoverDate = signal<Date | null>(null);
  protected readonly pendingStart = signal<Date | null>(null);
  protected readonly hours = signal(0);
  protected readonly minutes = signal(0);
  private readonly formDisabled = signal(false);

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** Set when a <label> forwards its click to the trigger: that click should only focus it. */
  private labelClick = false;

  private onChange: (value: DatepickerValue) => void = () => {};
  private onTouched: () => void = () => {};

  // --- Derived ---
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly locale = computed(() => LOCALES[this.i18n.language()] ?? 'es-MX');
  private readonly firstWeekDay = computed(() => this.weekStart() ?? WEEK_START[this.i18n.language()] ?? 1);
  private readonly min = computed(() => this.toDay(this.minDate()));
  private readonly max = computed(() => this.toDay(this.maxDate()));
  protected readonly visibleMonths = computed(() => Math.max(1, Math.min(2, this.months())));
  protected readonly timeEnabled = computed(() => this.showTime() && this.mode() === 'single');

  protected readonly weekdays = computed(() => {
    const short = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    const long = new Intl.DateTimeFormat(this.locale(), { weekday: 'long' });
    const sunday = new Date(2023, 0, 1);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(sunday, (this.firstWeekDay() + index) % 7);
      return { short: capitalize(short.format(date).replace('.', '').slice(0, 2)), long: capitalize(long.format(date)) };
    });
  });

  protected readonly panels = computed<MonthPanel[]>(() => {
    const monthFormat = new Intl.DateTimeFormat(this.locale(), { month: 'long' });
    const today = new Date();
    const hideOutside = this.visibleMonths() > 1;

    return Array.from({ length: this.visibleMonths() }, (_, index) => {
      const date = addMonths(this.viewDate(), index);
      const cells = buildMonthGrid(date.getFullYear(), date.getMonth(), this.firstWeekDay()).map<DayCell>((day) => {
        const outside = !isSameMonth(day, date);
        return {
          date: day,
          key: dayKey(day),
          day: day.getDate(),
          outside,
          disabled: this.isDayDisabled(day) || (outside && hideOutside),
          today: isSameDay(day, today),
        };
      });
      const weeks = Array.from({ length: 6 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
      return { key: dayKey(date), date, monthLabel: capitalize(monthFormat.format(date)), year: date.getFullYear(), weeks };
    });
  });

  protected readonly monthOptions = computed(() => {
    const format = new Intl.DateTimeFormat(this.locale(), { month: 'short' });
    const year = this.viewDate().getFullYear();
    return Array.from({ length: 12 }, (_, month) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return {
        month,
        label: capitalize(format.format(start).replace('.', '')),
        current: month === this.viewDate().getMonth(),
        disabled: this.isPeriodOutside(start, end),
      };
    });
  });

  protected readonly yearOptions = computed(() => {
    const first = this.yearPageStart();
    return Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
      const year = first + index;
      return {
        year,
        current: year === this.viewDate().getFullYear(),
        disabled: this.isPeriodOutside(new Date(year, 0, 1), new Date(year, 11, 31)),
      };
    });
  });

  protected readonly yearPageStart = computed(
    () => Math.floor(this.viewDate().getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE,
  );

  protected readonly hourOptions = Array.from({ length: 24 }, (_, hour) => hour);
  protected readonly minuteOptions = computed(() => {
    const step = Math.min(Math.max(1, this.minuteStep()), 30);
    return Array.from({ length: Math.ceil(60 / step) }, (_, index) => index * step);
  });

  protected readonly presets = computed<RangePreset[]>(() => {
    const today = startOfDay(new Date());
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return [
      { label: 'datepicker.preset.today', start: today, end: today },
      { label: 'datepicker.preset.yesterday', start: addDays(today, -1), end: addDays(today, -1) },
      { label: 'datepicker.preset.last7Days', start: addDays(today, -6), end: today },
      { label: 'datepicker.preset.last30Days', start: addDays(today, -29), end: today },
      { label: 'datepicker.preset.thisMonth', start: firstOfMonth, end: new Date(today.getFullYear(), today.getMonth() + 1, 0) },
      { label: 'datepicker.preset.lastMonth', start: addMonths(firstOfMonth, -1), end: addDays(firstOfMonth, -1) },
    ];
  });

  /** Range currently painted: the saved one, or the one being picked with the mouse. */
  private readonly rangeBounds = computed<{ start: Date | null; end: Date | null }>(() => {
    const pending = this.pendingStart();
    if (pending) {
      const hover = this.hoverDate();
      if (!hover) return { start: pending, end: null };
      return compareDays(hover, pending) < 0 ? { start: hover, end: pending } : { start: pending, end: hover };
    }
    const range = this.asRange(this.value());
    return { start: range?.start ?? null, end: range?.end ?? null };
  });

  protected readonly displayText = computed(() => {
    this.i18n.language();
    const value = this.value();
    const format = new Intl.DateTimeFormat(this.locale(), {
      dateStyle: 'medium',
      ...(this.timeEnabled() ? { timeStyle: 'short' } : {}),
    });

    switch (this.mode()) {
      case 'range': {
        const range = this.asRange(value);
        if (!range?.start) return '';
        return range.end ? `${format.format(range.start)} – ${format.format(range.end)}` : format.format(range.start);
      }
      case 'multiple': {
        const dates = this.asList(value);
        if (!dates.length) return '';
        if (dates.length <= 2) return dates.map((date) => format.format(date)).join(', ');
        return this.i18n.t('datepicker.selectedCount', { count: dates.length });
      }
      default: {
        const date = this.asDate(value);
        return date ? format.format(date) : '';
      }
    }
  });

  protected readonly hasValue = computed(() => this.displayText() !== '');

  protected readonly placeholderText = computed(() => {
    this.i18n.language();
    if (this.placeholder()) return this.placeholder()!;
    if (this.mode() === 'range') return this.i18n.t('datepicker.placeholderRange');
    if (this.mode() === 'multiple') return this.i18n.t('datepicker.placeholderMultiple');
    return this.i18n.t('datepicker.placeholder');
  });

  protected readonly prevDisabled = computed(() => {
    const min = this.min();
    if (!min) return false;
    const view = this.view();
    const date = this.viewDate();
    if (view === 'days') return compareDays(addDays(date, -1), min) < 0;
    if (view === 'months') return date.getFullYear() - 1 < min.getFullYear();
    return this.yearPageStart() - 1 < min.getFullYear();
  });

  protected readonly nextDisabled = computed(() => {
    const max = this.max();
    if (!max) return false;
    const view = this.view();
    const date = this.viewDate();
    if (view === 'days') return compareDays(addMonths(date, this.visibleMonths()), max) > 0;
    if (view === 'months') return date.getFullYear() + 1 > max.getFullYear();
    return this.yearPageStart() + YEARS_PER_PAGE > max.getFullYear();
  });

  ngOnInit(): void {
    this.resetView();
    this.destroyRef.onDestroy(() => this.stopTracking());
  }

  // --- ControlValueAccessor ---
  writeValue(value: unknown): void {
    this.value.set(this.normalize(value));
    this.syncTime();
    if (!this.open()) this.resetView();
  }

  registerOnChange(fn: (value: DatepickerValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) this.close(false);
  }

  // --- Popover ---
  protected toggle(): void {
    if (this.labelClick) {
      this.labelClick = false;
      return;
    }
    if (this.open()) this.close();
    else this.openPanel();
  }

  protected openPanel(): void {
    if (this.isDisabled() || this.open()) return;
    this.resetView();
    this.open.set(true);

    afterNextRender(
      () => {
        // The panel lives in the browser's top layer, so no parent overflow or z-index can hide it.
        this.panel()?.nativeElement.showPopover?.();
        this.placePanel();
        this.focusActiveDay();
        window.addEventListener('scroll', this.reposition, true);
        window.addEventListener('resize', this.reposition);
      },
      { injector: this.injector },
    );
  }

  protected close(returnFocus = true): void {
    if (!this.open()) return;
    this.open.set(false);
    this.stopTracking();
    this.pendingStart.set(null);
    this.hoverDate.set(null);
    this.onTouched();
    if (returnFocus) this.trigger()?.nativeElement.focus();
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!this.open() || this.inline()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }

  /** A click on our <label> only focuses the trigger, like a native input. */
  protected onDocumentClick(event: MouseEvent): void {
    if (!isOwnLabelClick(event, this.host.nativeElement, this.inputId())) return;
    this.labelClick = true;
    setTimeout(() => (this.labelClick = false));
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.inline()) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }

  // --- Selection ---
  protected selectDay(cell: DayCell): void {
    if (cell.disabled) return;
    const date = startOfDay(cell.date);
    this.focusDate.set(date);

    switch (this.mode()) {
      case 'single': {
        if (this.timeEnabled()) date.setHours(this.hours(), this.minutes());
        this.commit(date);
        if (!this.timeEnabled() && this.closeOnSelect()) this.close();
        break;
      }
      case 'multiple': {
        const dates = this.asList(this.value());
        const exists = dates.some((item) => isSameDay(item, date));
        const next = exists
          ? dates.filter((item) => !isSameDay(item, date))
          : [...dates, date].sort((a, b) => a.getTime() - b.getTime());
        this.commit(next);
        break;
      }
      case 'range': {
        const start = this.pendingStart();
        if (!start || compareDays(date, start) < 0) {
          this.pendingStart.set(date);
          this.hoverDate.set(null);
          return;
        }
        this.pendingStart.set(null);
        this.hoverDate.set(null);
        this.commit({ start, end: date });
        if (this.closeOnSelect()) this.close();
        break;
      }
    }
  }

  protected applyPreset(preset: RangePreset): void {
    this.pendingStart.set(null);
    this.hoverDate.set(null);
    this.commit({ start: new Date(preset.start), end: new Date(preset.end) });
    this.viewDate.set(this.firstOfMonth(addMonths(preset.end, -(this.visibleMonths() - 1))));
    this.focusDate.set(startOfDay(preset.end));
    if (this.closeOnSelect()) this.close();
  }

  protected isPresetActive(preset: RangePreset): boolean {
    const range = this.asRange(this.value());
    return !!range && isSameDay(range.start, preset.start) && isSameDay(range.end, preset.end);
  }

  protected selectToday(): void {
    const today = startOfDay(new Date());
    this.viewDate.set(this.firstOfMonth(today));
    this.focusDate.set(today);
    this.view.set('days');
    if (this.mode() === 'range' || this.isDayDisabled(today)) return;
    this.selectDay({ date: today, key: dayKey(today), day: today.getDate(), outside: false, disabled: false, today: true });
  }

  protected clear(event?: Event): void {
    event?.stopPropagation();
    this.pendingStart.set(null);
    this.hoverDate.set(null);
    this.commit(this.mode() === 'multiple' ? [] : null);
    this.onTouched();
  }

  protected setHours(value: string): void {
    this.hours.set(Number(value));
    this.applyTime();
  }

  protected setMinutes(value: string): void {
    this.minutes.set(Number(value));
    this.applyTime();
  }

  protected onDayHover(cell: DayCell): void {
    if (this.mode() === 'range' && this.pendingStart() && !cell.disabled) this.hoverDate.set(cell.date);
  }

  // --- Day state for the template ---
  protected isSelected(date: Date): boolean {
    const value = this.value();
    switch (this.mode()) {
      case 'multiple':
        return this.asList(value).some((item) => isSameDay(item, date));
      case 'range': {
        const { start, end } = this.rangeBounds();
        return isSameDay(start, date) || isSameDay(end, date);
      }
      default:
        return isSameDay(this.asDate(value), date);
    }
  }

  protected isRangeStart(date: Date): boolean {
    const { start, end } = this.rangeBounds();
    return this.mode() === 'range' && !!end && isSameDay(start, date) && !isSameDay(start, end);
  }

  protected isRangeEnd(date: Date): boolean {
    const { start, end } = this.rangeBounds();
    return this.mode() === 'range' && !!start && isSameDay(end, date) && !isSameDay(start, end);
  }

  protected isInRange(date: Date): boolean {
    if (this.mode() !== 'range') return false;
    const { start, end } = this.rangeBounds();
    return !!start && !!end && compareDays(date, start) > 0 && compareDays(date, end) < 0;
  }

  protected isFocusable(cell: DayCell): boolean {
    return isSameDay(cell.date, this.focusDate()) && !cell.outside;
  }

  protected dayClass(cell: DayCell): string {
    if (this.isSelected(cell.date)) return 'bg-(--primary-color) text-white font-semibold shadow-sm';
    if (cell.disabled) return 'text-(--secondary-text) opacity-35';
    if (this.isInRange(cell.date)) return 'text-(--primary-color) font-medium hover:bg-(--primary-color)/20';
    if (cell.outside) return 'text-(--secondary-text)/60 hover:bg-(--primary-color)/10';
    if (cell.today) return 'text-(--primary-color) font-bold hover:bg-(--primary-color)/10';
    return 'text-(--text-color) hover:bg-(--primary-color)/10 hover:text-(--primary-color)';
  }

  /** Background strip that joins the days of a range. */
  protected bandClass(date: Date): string {
    if (this.isRangeStart(date)) return 'left-1/2 right-0 rounded-l-lg';
    if (this.isRangeEnd(date)) return 'left-0 right-1/2 rounded-r-lg';
    return 'inset-x-0';
  }

  protected dayLabel(date: Date): string {
    return new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }).format(date);
  }

  // --- Header navigation ---
  protected previous(): void {
    this.shiftView(-1);
  }

  protected next(): void {
    this.shiftView(1);
  }

  protected showMonths(panelDate?: Date): void {
    if (panelDate) this.viewDate.set(this.firstOfMonth(panelDate));
    this.view.set('months');
  }

  protected showYears(panelDate?: Date): void {
    if (panelDate) this.viewDate.set(this.firstOfMonth(panelDate));
    this.view.set('years');
  }

  protected pickMonth(month: number): void {
    const date = new Date(this.viewDate().getFullYear(), month, 1);
    this.viewDate.set(date);
    this.focusDate.set(this.clampDay(new Date(date.getFullYear(), month, Math.min(this.focusDate().getDate(), 28))));
    this.view.set('days');
  }

  protected pickYear(year: number): void {
    this.viewDate.set(new Date(year, this.viewDate().getMonth(), 1));
    this.view.set('months');
  }

  // --- Keyboard navigation inside the days grid ---
  protected onGridKeydown(event: KeyboardEvent): void {
    const current = this.focusDate();
    let next: Date;
    const weekStart = this.firstWeekDay();

    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(current, -1);
        break;
      case 'ArrowRight':
        next = addDays(current, 1);
        break;
      case 'ArrowUp':
        next = addDays(current, -7);
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        break;
      case 'PageUp':
        next = addMonths(current, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(current, event.shiftKey ? 12 : 1);
        break;
      case 'Home':
        next = addDays(current, -((current.getDay() - weekStart + 7) % 7));
        break;
      case 'End':
        next = addDays(current, 6 - ((current.getDay() - weekStart + 7) % 7));
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const date = startOfDay(current);
        this.selectDay({ date, key: dayKey(date), day: date.getDate(), outside: false, disabled: this.isDayDisabled(date), today: false });
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    next = this.clampDay(next);
    this.focusDate.set(next);
    this.onDayHover({ date: next, key: '', day: 0, outside: false, disabled: this.isDayDisabled(next), today: false });
    this.ensureVisible(next);
    afterNextRender(() => this.focusActiveDay(), { injector: this.injector });
  }

  // --- Helpers ---
  private commit(value: DatepickerValue): void {
    this.value.set(value);
    this.onChange(value);
  }

  private applyTime(): void {
    const date = this.asDate(this.value());
    if (!date) return;
    const next = new Date(date);
    next.setHours(this.hours(), this.minutes(), 0, 0);
    this.commit(next);
  }

  private syncTime(): void {
    const date = this.asDate(this.value());
    if (!date) return;
    const step = this.minuteOptions()[1] ?? 60;
    this.hours.set(date.getHours());
    this.minutes.set(Math.floor(date.getMinutes() / step) * step);
  }

  private resetView(): void {
    const anchor = this.clampDay(this.anchorDate());
    this.view.set('days');
    this.focusDate.set(anchor);
    this.viewDate.set(this.firstOfMonth(anchor));
  }

  /** Date the calendar opens on: the selection, or today. */
  private anchorDate(): Date {
    const value = this.value();
    switch (this.mode()) {
      case 'range':
        return startOfDay(this.asRange(value)?.start ?? new Date());
      case 'multiple':
        return startOfDay(this.asList(value).at(-1) ?? new Date());
      default:
        return startOfDay(this.asDate(value) ?? new Date());
    }
  }

  private shiftView(direction: number): void {
    const view = this.view();
    const step = view === 'days' ? 1 : view === 'months' ? 12 : 12 * YEARS_PER_PAGE;
    this.viewDate.update((date) => this.firstOfMonth(addMonths(date, direction * step)));
  }

  private ensureVisible(date: Date): void {
    const first = this.viewDate();
    const last = addMonths(first, this.visibleMonths() - 1);
    if (compareDays(date, first) < 0) this.viewDate.set(this.firstOfMonth(date));
    else if (compareDays(date, new Date(last.getFullYear(), last.getMonth() + 1, 0)) > 0) {
      this.viewDate.set(this.firstOfMonth(addMonths(date, -(this.visibleMonths() - 1))));
    }
  }

  private focusActiveDay(): void {
    const panel = this.panel()?.nativeElement;
    const target = panel?.querySelector<HTMLElement>('[data-active-day="true"]');
    target?.focus({ preventScroll: true });
  }

  private placePanel(): void {
    const panel = this.panel()?.nativeElement;
    const trigger = this.trigger()?.nativeElement;
    if (panel && trigger && !this.inline()) positionFloating(panel, trigger, 'phone');
  }

  private stopTracking(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }

  private isDayDisabled(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    if (min && compareDays(date, min) < 0) return true;
    if (max && compareDays(date, max) > 0) return true;
    return this.isDateDisabled()?.(date) ?? false;
  }

  private isPeriodOutside(start: Date, end: Date): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && compareDays(end, min) < 0) || (!!max && compareDays(start, max) > 0);
  }

  private clampDay(date: Date): Date {
    const min = this.min();
    const max = this.max();
    if (min && compareDays(date, min) < 0) return min;
    if (max && compareDays(date, max) > 0) return max;
    return startOfDay(date);
  }

  private firstOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private toDay(value: Date | string | null): Date | null {
    const date = toDate(value);
    return date ? startOfDay(date) : null;
  }

  private normalize(value: unknown): DatepickerValue {
    switch (this.mode()) {
      case 'range': {
        const range = value as Partial<DateRangeValue> | null;
        const start = toDate(range?.start);
        return start ? { start, end: toDate(range?.end) } : null;
      }
      case 'multiple':
        return Array.isArray(value) ? value.map(toDate).filter((date): date is Date => !!date) : [];
      default:
        return toDate(value);
    }
  }

  private asDate(value: DatepickerValue): Date | null {
    return value instanceof Date ? value : null;
  }

  private asRange(value: DatepickerValue): DateRangeValue | null {
    return value && !(value instanceof Date) && !Array.isArray(value) ? value : null;
  }

  private asList(value: DatepickerValue): Date[] {
    return Array.isArray(value) ? value : [];
  }
}