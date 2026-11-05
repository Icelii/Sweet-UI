import { afterNextRender, booleanAttribute, ChangeDetectionStrategy, Component, contentChild, DestroyRef, Directive, ElementRef, inject, Injector, input, model, viewChild } from '@angular/core';

export type DropdownAlign = 'start' | 'end';

let nextId = 0;

const ITEM_SELECTOR = '[role^="menuitem"]:not([aria-disabled="true"]):not(:disabled)';

/** Marks the element that opens the menu. */
@Directive({
  selector: '[appDropdownTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'dropdown.open()',
    '[attr.aria-controls]': 'dropdown.menuId',
    '(click)': 'dropdown.toggle()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DropdownTrigger {
  protected readonly dropdown = inject(Dropdown);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    this.dropdown.openMenu(event.key === 'ArrowDown' ? 'first' : 'last');
  }
}

/**
 * A menu option. Closes the menu when clicked unless it has `keepOpen`.
 * Give it `[checked]` to make it a checkable option (role="menuitemcheckbox").
 */
@Directive({
  selector: '[appDropdownItem]',
  host: {
    class: 'ui-dropdown-item',
    tabindex: '-1',
    '[attr.role]': 'checked() === undefined ? "menuitem" : "menuitemcheckbox"',
    '[attr.aria-checked]': 'checked() ?? null',
    '(click)': 'onClick()',
  },
})
export class DropdownItem {
  private readonly dropdown = inject(Dropdown);

  readonly keepOpen = input(false, { transform: booleanAttribute });
  readonly checked = input<boolean | undefined>(undefined);

  protected onClick(): void {
    if (!this.keepOpen()) this.dropdown.close();
  }
}

/**
 * Menu that opens from any trigger. The panel lives in the browser's top layer, so it is never
 * cut by `overflow: hidden` parents, and it flips above the trigger when there is no room below.
 * ```html
 * <app-dropdown align="end">
 *   <button appDropdownTrigger class="ui-btn ui-btn-default">Options</button>
 *   <div class="ui-dropdown-header">Account</div>
 *   <button appDropdownItem><app-tabler-icon name="edit" [size]="18" />Edit</button>
 *   <div class="ui-dropdown-divider"></div>
 *   <button appDropdownItem class="ui-dropdown-item-danger">Delete</button>
 * </app-dropdown>
 * ```
 * Keyboard: ↑/↓ on the trigger opens it, ↑/↓/Home/End move between items, Esc closes it.
 */
@Component({
  selector: 'app-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-flex',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
  template: `
    <ng-content select="[appDropdownTrigger]" />
    <div #menu popover="manual" role="menu" tabindex="-1" class="ui-dropdown-menu" [class]="menuClass()" [id]="menuId" (keydown)="onMenuKeydown($event)">
      <ng-content />
    </div>
  `,
})
export class Dropdown {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly reposition = () => this.place();

  readonly align = input<DropdownAlign>('start');
  /** Extra classes for the panel, e.g. a width (`w-72`). */
  readonly menuClass = input('');
  readonly open = model(false);

  readonly menuId = `app-dropdown-${nextId++}`;

  private readonly trigger = contentChild(DropdownTrigger);
  private readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTracking());
  }

  toggle(): void {
    if (this.open()) this.close();
    else this.openMenu();
  }

  openMenu(focus: 'menu' | 'first' | 'last' = 'menu'): void {
    if (this.open()) {
      this.focusItem(focus === 'last' ? -1 : 0);
      return;
    }
    this.open.set(true);
    afterNextRender(
      () => {
        const menu = this.menu().nativeElement;
        menu.showPopover?.();
        this.place();
        if (focus === 'menu') menu.focus({ preventScroll: true });
        else this.focusItem(focus === 'first' ? 0 : -1);
        window.addEventListener('scroll', this.reposition, true);
        window.addEventListener('resize', this.reposition);
      },
      { injector: this.injector },
    );
  }

  close(returnFocus = true): void {
    if (!this.open()) return;
    this.open.set(false);
    const menu = this.menu().nativeElement;
    if (menu.matches(':popover-open')) menu.hidePopover();
    this.stopTracking();
    if (returnFocus) this.trigger()?.element.nativeElement.focus({ preventScroll: true });
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const items = this.items();
    const index = items.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusItem(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusItem(index < 0 ? -1 : index - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(-1);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close(false);
        break;
    }
  }

  private items(): HTMLElement[] {
    return Array.from(this.menu().nativeElement.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
  }

  /** Wraps around: -1 is the last item, length is the first. */
  private focusItem(index: number): void {
    const items = this.items();
    if (!items.length) return;
    items[((index % items.length) + items.length) % items.length].focus({ preventScroll: false });
  }

  private place(): void {
    const anchor = this.trigger()?.element.nativeElement ?? this.host.nativeElement;
    const panel = this.menu().nativeElement;
    const margin = 8;
    const gap = 6;
    const rect = anchor.getBoundingClientRect();
    const size = panel.getBoundingClientRect();

    let left = this.align() === 'end' ? rect.right - size.width : rect.left;
    left = Math.min(Math.max(margin, left), window.innerWidth - size.width - margin);

    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    let top: number;
    if (size.height + gap <= spaceBelow || spaceBelow >= spaceAbove) top = rect.bottom + gap;
    else top = rect.top - gap - size.height;
    top = Math.min(Math.max(margin, top), window.innerHeight - size.height - margin);

    panel.style.left = `${Math.max(margin, left)}px`;
    panel.style.top = `${Math.max(margin, top)}px`;
  }

  private stopTracking(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }
}
