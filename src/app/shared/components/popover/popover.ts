import { afterNextRender, ChangeDetectionStrategy, Component, contentChild, DestroyRef, Directive, ElementRef, inject, Injector, input, model, viewChild } from '@angular/core';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { FloatingPlacement, positionAround } from '@shared/utils/floating';

let nextId = 0;

/** Marks the element that opens the popover. */
@Directive({
  selector: '[appPopoverTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'popover.open()',
    '[attr.aria-controls]': 'popover.panelId',
    '(click)': 'popover.toggle()',
  },
})
export class PopoverTrigger {
  protected readonly popover = inject(Popover);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
}

/**
 * Click-to-open panel with an arrow, for extra info, quick forms or confirmations.
 * ```html
 * <app-popover title="Details" placement="right">
 *   <button appPopoverTrigger class="ui-btn">Open</button>
 *   <div class="ui-popover-body">…</div>
 * </app-popover>
 * ```
 * Closes with Esc, the X, or a click outside. Call `close()` from a template ref to close it from a button.
 */
@Component({
  selector: 'app-popover',
  imports: [TablerIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-flex',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
  template: `
    <ng-content select="[appPopoverTrigger]" />
    <div #panel popover="manual" role="dialog" tabindex="-1" class="ui-popover outline-none" [class]="panelClass()" [id]="panelId" [attr.aria-label]="title() || null" (keydown.escape)="close()">
      @if (title()) {
        <div class="ui-popover-header">
          <span class="truncate">{{ title() }}</span>
          <button type="button" (click)="close()" class="size-6 -mr-1 inline-flex items-center justify-center shrink-0 rounded-md text-(--secondary-text) hover:text-(--text-color) hover:bg-(--bg-2) cursor-pointer" [attr.aria-label]="'common.close' | translate">
            <app-tabler-icon name="close" [size]="16" />
          </button>
        </div>
      }
      <ng-content />
    </div>
  `,
})
export class Popover {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly reposition = () => this.place();

  readonly title = input<string>();
  readonly placement = input<FloatingPlacement>('bottom');
  /** Extra classes for the panel, e.g. a width (`w-72`). */
  readonly panelClass = input('');
  readonly open = model(false);

  readonly panelId = `app-popover-${nextId++}`;

  private readonly trigger = contentChild(PopoverTrigger);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTracking());
  }

  toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }

  show(): void {
    if (this.open()) return;
    this.open.set(true);
    afterNextRender(
      () => {
        const panel = this.panel().nativeElement;
        panel.showPopover?.();
        this.place();
        // Focus the first field or button inside, or the panel itself.
        const focusable = panel.querySelector<HTMLElement>('input, textarea, select, .ui-popover-body button, .ui-popover-body a');
        (focusable ?? panel).focus({ preventScroll: true });
        window.addEventListener('scroll', this.reposition, true);
        window.addEventListener('resize', this.reposition);
      },
      { injector: this.injector },
    );
  }

  close(returnFocus = true): void {
    if (!this.open()) return;
    this.open.set(false);
    const panel = this.panel().nativeElement;
    if (panel.matches(':popover-open')) panel.hidePopover();
    this.stopTracking();
    if (returnFocus) this.trigger()?.element.nativeElement.focus({ preventScroll: true });
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }

  private place(): void {
    const anchor = this.trigger()?.element.nativeElement ?? this.host.nativeElement;
    positionAround(this.panel().nativeElement, anchor, this.placement(), 10);
  }

  private stopTracking(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }
}