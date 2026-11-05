import { booleanAttribute, ChangeDetectionStrategy, Component, contentChildren, inject, input, model } from '@angular/core';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';

export type AccordionVariant = 'default' | 'flush' | 'separated';

let nextId = 0;

/**
 * One collapsible section. Extra header content (a badge, a count) goes in `[accordionAside]`.
 * Works alone too, without <app-accordion>.
 */
@Component({
  selector: 'app-accordion-item',
  imports: [TablerIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ui-accordion-item',
    '[class.is-open]': 'open()',
  },
  template: `
    <div class="ui-accordion-heading" role="heading" [attr.aria-level]="headingLevel()">
      <button type="button" class="ui-accordion-trigger" [id]="triggerId" [attr.aria-expanded]="open()" [attr.aria-controls]="panelId" [disabled]="disabled()" (click)="toggle()">
        @if (icon(); as icon) {
          <span class="ui-accordion-icon"><app-tabler-icon [name]="icon" [size]="18" /></span>
        }
        <span class="flex-1 min-w-0 flex flex-col gap-0.5">
          <span>{{ title() }}</span>
          @if (subtitle()) {
            <span class="ui-accordion-subtitle">{{ subtitle() }}</span>
          }
        </span>
        <ng-content select="[accordionAside]" />
        <app-tabler-icon name="chevron-down" [size]="18" class="ui-accordion-chevron" />
      </button>
    </div>
    <div class="ui-accordion-panel" role="region" [id]="panelId" [attr.aria-labelledby]="triggerId" [attr.inert]="open() ? null : ''">
      <div>
        <div class="ui-accordion-body"><ng-content /></div>
      </div>
    </div>
  `,
})
export class AccordionItem {
  private readonly accordion = inject(Accordion, { optional: true });

  readonly title = input('');
  readonly subtitle = input<string>();
  readonly icon = input<TablerIconName>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly headingLevel = input(3);
  readonly open = model(false);

  private readonly uid = nextId++;
  protected readonly triggerId = `app-accordion-trigger-${this.uid}`;
  protected readonly panelId = `app-accordion-panel-${this.uid}`;

  toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (next) this.accordion?.onOpened(this);
  }
}

/**
 * Group of collapsible sections. By default opening one closes the others; `multiple` keeps them open.
 * ```html
 * <app-accordion variant="separated">
 *   <app-accordion-item title="Question" [open]="true">Answer</app-accordion-item>
 * </app-accordion>
 * ```
 */
@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ui-accordion',
    '[class.ui-accordion-flush]': "variant() === 'flush'",
    '[class.ui-accordion-separated]': "variant() === 'separated'",
  },
  template: `<ng-content />`,
})
export class Accordion {
  readonly variant = input<AccordionVariant>('default');
  readonly multiple = input(false, { transform: booleanAttribute });

  private readonly items = contentChildren(AccordionItem);

  onOpened(opened: AccordionItem): void {
    if (this.multiple()) return;
    for (const item of this.items()) {
      if (item !== opened) item.open.set(false);
    }
  }

  expandAll(): void {
    for (const item of this.items()) if (!item.disabled()) item.open.set(true);
  }

  collapseAll(): void {
    for (const item of this.items()) item.open.set(false);
  }
}