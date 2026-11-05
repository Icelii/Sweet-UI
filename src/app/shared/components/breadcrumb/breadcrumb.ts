import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NavSection } from '@core/interfaces/navigation';
import { I18n, TranslationKey } from '@core/i18n/i18n';
import { NAVIGATION } from '@core/navigation/navigation';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { filter, map } from 'rxjs';

export interface BreadcrumbItem {
  /** Translation key or plain text. */
  label: TranslationKey | string;
  /** Leave it out for items that are not links (the last one never is). */
  path?: string;
  icon?: TablerIconName;
}

export type BreadcrumbSeparator = 'chevron' | 'slash' | 'dot';
export type BreadcrumbVariant = 'plain' | 'contained';

const HOME: BreadcrumbItem = { label: 'nav.dashboard', path: '/dashboard', icon: 'home' };

/** Builds the trail for a URL from the sidebar navigation: section item → child link. */
export function breadcrumbsFromNavigation(url: string, sections: NavSection[] = NAVIGATION): BreadcrumbItem[] {
  const path = url.split(/[?#]/)[0];
  const matches = (target: string) => !!target && (path === target || path.startsWith(target + '/'));

  for (const section of sections) {
    for (const item of section.items) {
      const child = item.children?.find((link) => matches(link.path));
      if (child) return [{ label: item.label, icon: item.icon }, { label: child.label, path: child.path }];
      if (!item.children && matches(item.path)) return [{ label: item.label, path: item.path, icon: item.icon }];
    }
  }
  return [];
}

/**
 * Breadcrumb trail. Pass `items`, or leave them out to build it from the current route and `NAVIGATION`.
 * On phones only the first and last items show; the ones in between fold into a "…" menu.
 * ```html
 * <app-breadcrumb />
 * <app-breadcrumb [items]="[{ label: 'nav.tables', path: '/ui/tables' }, { label: 'Detalle' }]" separator="slash" />
 * ```
 */
@Component({
  selector: 'app-breadcrumb',
  imports: [NgTemplateOutlet, RouterLink, TablerIcon, TranslatePipe],
  templateUrl: './breadcrumb.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
})
export class Breadcrumb {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);

  readonly items = input<BreadcrumbItem[]>();
  readonly separator = input<BreadcrumbSeparator>('chevron');
  readonly variant = input<BreadcrumbVariant>('plain');
  /** Adds the dashboard link (home icon) at the start. */
  readonly home = input(true);
  /** From `sm` up, trails longer than this fold their middle items into "…". */
  readonly maxItems = input(5);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly trail = computed<BreadcrumbItem[]>(() => {
    const items = this.items() ?? breadcrumbsFromNavigation(this.url());
    if (!this.home() || items[0]?.path === HOME.path) return items;
    return [HOME, ...items];
  });

  protected readonly first = computed(() => this.trail()[0]);
  protected readonly last = computed(() => this.trail().at(-1));
  protected readonly middle = computed(() => this.trail().slice(1, -1));

  /** Middle items hidden on desktop because the trail is longer than `maxItems`. */
  protected readonly collapsed = computed(() => {
    const middle = this.middle();
    const keep = Math.max(this.maxItems() - 2, 1);
    return middle.length > keep ? middle.slice(0, middle.length - keep) : [];
  });

  protected readonly shown = computed(() => this.middle().slice(this.collapsed().length));

  protected label(item: BreadcrumbItem): string {
    return this.i18n.t(item.label as TranslationKey);
  }

  protected closeMenu(): void {
    (document.activeElement as HTMLElement | null)?.blur();
  }
}