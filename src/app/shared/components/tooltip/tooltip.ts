import { DOCUMENT } from '@angular/common';
import { booleanAttribute, Directive, effect, ElementRef, inject, input, OnDestroy, signal } from '@angular/core';
import { FloatingPlacement, positionAround } from '@shared/utils/floating';

export type TooltipTone = 'dark' | 'light' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

let nextId = 0;

/**
 * Small hint shown on hover, keyboard focus and tap.
 * ```html
 * <button appTooltip="Copy link" tooltipPlacement="bottom">…</button>
 * ```
 * Disabled buttons don't fire mouse events: put the tooltip on a wrapper `<span tabindex="0">`.
 */
@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show(0)',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
    '(pointerdown)': 'onPointerDown($event)',
    '[attr.aria-describedby]': 'visible() ? id : null',
  },
})
export class Tooltip implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly text = input.required<string>({ alias: 'appTooltip' });
  readonly tooltipPlacement = input<FloatingPlacement>('top');
  readonly tooltipTone = input<TooltipTone>('dark');
  /** Hover delay in ms. Keyboard focus shows it right away. */
  readonly tooltipDelay = input(150);
  readonly tooltipDisabled = input(false, { transform: booleanAttribute });

  protected readonly id = `app-tooltip-${nextId++}`;
  protected readonly visible = signal(false);

  private element: HTMLElement | null = null;
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private touchTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly reposition = () => this.place();

  constructor() {
    // Keep the open tooltip in sync, e.g. "Copy" → "Copied!".
    effect(() => {
      const text = this.text();
      const tone = this.tooltipTone();
      if (!this.element) return;
      this.element.textContent = text;
      this.element.className = this.toneClass(tone);
      if (this.visible()) this.place();
    });
  }

  show(delay = this.tooltipDelay()): void {
    if (this.tooltipDisabled() || !this.text()) return;
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.open(), delay);
  }

  hide(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.touchTimer);
    if (!this.visible()) return;
    this.visible.set(false);
    if (this.element?.matches(':popover-open')) this.element.hidePopover();
    window.removeEventListener('scroll', this.reposition, true);
  }

  /** Touch screens have no hover: show on tap and hide shortly after. */
  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'touch') return;
    this.show(0);
    clearTimeout(this.touchTimer);
    this.touchTimer = setTimeout(() => this.hide(), 1800);
  }

  ngOnDestroy(): void {
    this.hide();
    this.element?.remove();
  }

  private open(): void {
    const element = (this.element ??= this.create());
    element.textContent = this.text();
    element.className = this.toneClass(this.tooltipTone());
    element.showPopover?.();
    this.visible.set(true);
    this.place();
    window.addEventListener('scroll', this.reposition, true);
  }

  private create(): HTMLElement {
    const element = this.document.createElement('div');
    element.id = this.id;
    element.setAttribute('role', 'tooltip');
    element.setAttribute('popover', 'manual');
    this.document.body.appendChild(element);
    return element;
  }

  private place(): void {
    if (this.element) positionAround(this.element, this.host.nativeElement, this.tooltipPlacement());
  }

  private toneClass(tone: TooltipTone): string {
    return tone === 'dark' ? 'ui-tooltip' : `ui-tooltip ui-tooltip-${tone}`;
  }
}