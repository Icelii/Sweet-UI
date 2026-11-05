import { booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChildren, ElementRef, inject, input, model, viewChild } from '@angular/core';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';

export type TabsVariant = 'line' | 'pills' | 'boxed';

let nextId = 0;

/** One tab and its panel. The panel content is the tag's content. */
@Component({
  selector: 'app-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tabpanel',
    tabindex: '0',
    class: 'block outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)/40 rounded-lg',
    '[id]': 'panelId',
    '[attr.aria-labelledby]': 'tabId',
    '[hidden]': '!active()',
  },
  template: `<ng-content />`,
})
export class Tab {
  private readonly tabs = inject(Tabs);

  /** Unique key, used by `[(selected)]` on <app-tabs>. */
  readonly id = input('');
  readonly label = input('');
  readonly icon = input<TablerIconName>();
  readonly badge = input<string | number | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly uid = nextId++;
  readonly tabId = `app-tab-${this.uid}`;
  readonly panelId = `app-tabpanel-${this.uid}`;

  protected readonly active = computed(() => this.tabs.current() === this.id());
}

/**
 * Tabs with keyboard support (←/→, ↑/↓, Home, End) and automatic activation.
 * ```html
 * <app-tabs [(selected)]="tab" variant="pills">
 *   <app-tab id="profile" label="Profile" icon="user">…</app-tab>
 *   <app-tab id="billing" label="Billing" [badge]="2">…</app-tab>
 * </app-tabs>
 * ```
 * The tab row scrolls sideways when it does not fit. `vertical` puts the tabs on the side from 768px up.
 */
@Component({
  selector: 'app-tabs',
  imports: [TablerIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -- Arrow keys from the focused tab button. -->
    <div #list role="tablist" class="ui-tabs-list" [attr.aria-label]="label() || null" [attr.aria-orientation]="vertical() ? 'vertical' : 'horizontal'" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab.id()) {
        <button
          type="button"
          role="tab"
          class="ui-tab"
          [id]="tab.tabId"
          [attr.aria-selected]="current() === tab.id()"
          [attr.aria-controls]="tab.panelId"
          [tabIndex]="current() === tab.id() ? 0 : -1"
          [disabled]="tab.disabled()"
          (click)="select(tab.id())"
        >
          @if (tab.icon(); as icon) {
            <app-tabler-icon [name]="icon" [size]="18" />
          }
          {{ tab.label() }}
          @if (tab.badge() !== null) {
            <span class="ui-badge ui-badge-pill ui-badge-sm" [class.ui-badge-solid]="current() === tab.id()">{{ tab.badge() }}</span>
          }
        </button>
      }
    </div>
    <div class="ui-tabs-panels">
      <ng-content />
    </div>
  `,
})
export class Tabs {
  readonly variant = input<TabsVariant>('line');
  readonly vertical = input(false, { transform: booleanAttribute });
  /** Tabs share the full width. */
  readonly justified = input(false, { transform: booleanAttribute });
  /** Accessible name of the tab list. */
  readonly label = input<string>();
  readonly selected = model<string | null>(null);

  protected readonly tabs = contentChildren(Tab);
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  /** The selected tab, or the first enabled one. */
  readonly current = computed(() => {
    const tabs = this.tabs();
    const selected = this.selected();
    if (selected && tabs.some((tab) => tab.id() === selected && !tab.disabled())) return selected;
    return tabs.find((tab) => !tab.disabled())?.id() ?? null;
  });

  protected readonly classes = computed(() =>
    [
      'block min-w-0',
      `ui-tabs-${this.variant()}`,
      this.vertical() ? 'ui-tabs-vertical' : '',
      this.justified() ? 'ui-tabs-justified' : '',
    ].join(' '),
  );

  select(id: string): void {
    this.selected.set(id);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const enabled = this.tabs().filter((tab) => !tab.disabled());
    const index = enabled.findIndex((tab) => tab.id() === this.current());
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = enabled.length - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % enabled.length;
    else next = (index - 1 + enabled.length) % enabled.length;

    const tab = enabled[next];
    if (!tab) return;
    this.select(tab.id());
    const button = this.list().nativeElement.querySelector<HTMLElement>(`#${tab.tabId}`);
    button?.focus();
    button?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}