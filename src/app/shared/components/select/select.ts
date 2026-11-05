import { afterNextRender, booleanAttribute, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, forwardRef, inject, Injector, input, model, OnInit, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { isOwnLabelClick, positionFloating } from '@shared/utils/floating';

export interface SelectOption<T = unknown> {
  value: T;
  label: string;
  description?: string;
  icon?: TablerIconName;
  disabled?: boolean;
}

let nextId = 0;

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

@Component({
  selector: 'app-select',
  imports: [TablerIcon, TranslatePipe],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true }],
  host: {
    class: 'relative block',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Select<T = unknown> implements ControlValueAccessor, OnInit {
  private readonly i18n = inject(I18n);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reposition = () => this.placePanel();

  // --- Inputs ---
  readonly options = input<SelectOption<T>[]>([]);
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Adds a search box at the top of the list. */
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly placeholder = input<string | null>(null);
  /** Icon shown at the start of the field. */
  readonly icon = input<TablerIconName | null>(null);
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly inputId = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Works with `[(value)]` as well as with reactive forms. */
  readonly value = model<T | T[] | null>(null);

  // --- State ---
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);
  private readonly formDisabled = signal(false);
  protected readonly listId = `app-select-${nextId++}`;
  protected readonly labelId = signal<string | null>(null);

  private readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  private labelClick = false;
  private onChange: (value: T | T[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  // --- Derived ---
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly filtered = computed(() => {
    const query = normalize(this.query().trim());
    if (!query) return this.options();
    return this.options().filter((option) =>
      normalize(`${option.label} ${option.description ?? ''}`).includes(query),
    );
  });

  protected readonly selectedOptions = computed(() => {
    const value = this.value();
    if (this.multiple()) {
      const values = Array.isArray(value) ? value : [];
      return this.options().filter((option) => values.includes(option.value));
    }
    const option = this.options().find((item) => item.value === value);
    return option ? [option] : [];
  });

  protected readonly hasValue = computed(() => this.selectedOptions().length > 0);

  protected readonly placeholderText = computed(() => {
    this.i18n.language();
    return this.placeholder() ?? this.i18n.t(this.multiple() ? 'select.placeholderMultiple' : 'select.placeholder');
  });

  protected readonly activeId = computed(() =>
    this.activeIndex() >= 0 ? `${this.listId}-option-${this.activeIndex()}` : null,
  );

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.stopTracking());
    afterNextRender(() => this.linkLabel(), { injector: this.injector });
  }

  // --- ControlValueAccessor ---
  writeValue(value: T | T[] | null): void {
    this.value.set(this.multiple() ? (Array.isArray(value) ? [...value] : []) : (value ?? null));
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) this.close(false);
  }

  // --- Open / close ---
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
    this.query.set('');
    const selected = this.selectedOptions()[0];
    this.activeIndex.set(selected ? this.filtered().indexOf(selected) : this.firstEnabled(0, 1));
    this.open.set(true);

    afterNextRender(
      () => {
        this.panel()?.nativeElement.showPopover?.();
        this.placePanel();
        (this.search()?.nativeElement ?? this.list()?.nativeElement)?.focus({ preventScroll: true });
        this.scrollToActive();
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
    this.onTouched();
    if (returnFocus) this.trigger()?.nativeElement.focus();
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }

  /** A click on our <label> only focuses the field, like a native select. */
  protected onDocumentClick(event: MouseEvent): void {
    if (!isOwnLabelClick(event, this.host.nativeElement, this.inputId())) return;
    this.trigger()?.nativeElement.focus();
  }

  // --- Selection ---
  protected choose(option: SelectOption<T>): void {
    if (option.disabled) return;

    if (this.multiple()) {
      const current = (this.value() as T[] | null) ?? [];
      const next = current.includes(option.value)
        ? current.filter((value) => value !== option.value)
        : [...current, option.value];
      this.commit(next);
      this.activeIndex.set(this.filtered().indexOf(option));
      return;
    }

    this.commit(option.value);
    this.close();
  }

  protected remove(option: SelectOption<T>, event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) return;
    this.commit(((this.value() as T[] | null) ?? []).filter((value) => value !== option.value));
    this.onTouched();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.commit(this.multiple() ? [] : null);
    this.onTouched();
  }

  protected isSelected(option: SelectOption<T>): boolean {
    return this.selectedOptions().includes(option);
  }

  protected onSearch(text: string): void {
    this.query.set(text);
    this.activeIndex.set(this.firstEnabled(0, 1));
  }

  // --- Keyboard ---
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      this.openPanel();
    } else if (event.key === 'Backspace' && this.multiple()) {
      const last = this.selectedOptions().at(-1);
      if (last) this.remove(last, event);
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const options = this.filtered();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(this.activeIndex() + 1, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(this.activeIndex() - 1, -1));
        break;
      case 'Home':
        if (this.search()) return;
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(0, 1));
        break;
      case 'End':
        if (this.search()) return;
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(options.length - 1, -1));
        break;
      case 'Enter': {
        event.preventDefault();
        const option = options[this.activeIndex()];
        if (option) this.choose(option);
        break;
      }
      case ' ':
        if (this.search()) return;
        event.preventDefault();
        if (options[this.activeIndex()]) this.choose(options[this.activeIndex()]);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close();
        return;
      case 'Tab':
        this.close(false);
        return;
      default:
        return;
    }
    this.scrollToActive();
  }

  // --- Helpers ---
  private commit(value: T | T[] | null): void {
    this.value.set(value);
    this.onChange(value);
    if (this.open()) afterNextRender(() => this.placePanel(), { injector: this.injector });
  }

  /** Next enabled option from `start` in `step` direction, or -1. */
  private firstEnabled(start: number, step: 1 | -1): number {
    const options = this.filtered();
    for (let index = start; index >= 0 && index < options.length; index += step) {
      if (!options[index].disabled) return index;
    }
    // Nothing further that way: keep the current option if it is still valid.
    const current = options[this.activeIndex()];
    return current && !current.disabled ? this.activeIndex() : -1;
  }

  private scrollToActive(): void {
    afterNextRender(
      () => {
        const id = this.activeId();
        if (id) this.panel()?.nativeElement.querySelector(`#${id}`)?.scrollIntoView({ block: 'nearest' });
      },
      { injector: this.injector },
    );
  }

  private placePanel(): void {
    const panel = this.panel()?.nativeElement;
    const trigger = this.trigger()?.nativeElement;
    if (panel && trigger) positionFloating(panel, trigger, 'anchor');
  }

  private stopTracking(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }

  /** The trigger is not a native control, so we point it at its <label> for screen readers. */
  private linkLabel(): void {
    const id = this.inputId();
    if (!id) return;
    const label = document.querySelector<HTMLLabelElement>(`label[for="${id}"]`);
    if (!label) return;
    label.id ||= `${id}-label`;
    this.labelId.set(label.id);
  }
}