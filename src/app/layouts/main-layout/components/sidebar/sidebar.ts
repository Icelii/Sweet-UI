import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { BRAND, brandLogo } from '@core/config/brand';
import { NavItem, NavLink } from '@core/interfaces/navigation';
import { flattenNavigation, NAVIGATION } from '@core/navigation/navigation';
import { Theme } from '@core/services/theme';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { LayoutState } from '@layouts/main-layout/layout-state';

/** Sidebar: logo, collapse button and navigation with submenus. */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, TablerIcon, TranslatePipe],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
})
export class Sidebar {
  private readonly router = inject(Router);
  protected readonly theme = inject(Theme);
  protected readonly layout = inject(LayoutState);
  protected readonly brand = BRAND;
  protected readonly logo = computed(() => brandLogo(this.theme.isDark()));

  protected readonly navItems = flattenNavigation(NAVIGATION);
  protected readonly isExpanded = this.layout.isExpanded;
  protected readonly openSubmenu = signal<string | null>(null);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => stripQuery(event.urlAfterRedirects)),
    ),
    { initialValue: stripQuery(this.router.url) },
  );

  protected readonly activeLink = computed(() => {
    const url = this.currentPath();
    let best: NavLink | null = null;
    let bestLength = -1;

    for (const link of navLinks(this.navItems)) {
      for (const path of [link.path, ...(link.match ?? [])]) {
        if (path.length > bestLength && matchesPath(url, path)) {
          best = link;
          bestLength = path.length;
        }
      }
    }
    return best;
  });

  constructor() {
    effect(() => {
      const active = this.activeLink();
      if (!active) return;
      const parent = this.navItems.find((item) => item.children?.includes(active));
      if (parent) this.openSubmenu.set(parent.path);
    });
  }

  protected navIconSize(icon: TablerIconName): number {
    return icon === 'banners' || icon === 'audit' ? 24 : 22;
  }

  protected isNavActive(link: NavLink): boolean {
    return this.activeLink() === link;
  }

  protected isChildActive(item: NavItem): boolean {
    const active = this.activeLink();
    return !!active && !!item.children?.includes(active);
  }

  protected isSubmenuOpen(path: string): boolean {
    return this.openSubmenu() === path;
  }

  protected toggleSubmenu(item: NavItem): void {
    if (!this.isExpanded()) {
      this.layout.expandSidebar();
      this.openSubmenu.set(item.path);
      return;
    }
    this.openSubmenu.update((current) => (current === item.path ? null : item.path));
  }
}

function stripQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

function matchesPath(url: string, path: string): boolean {
  return url === path || url.startsWith(`${path}/`);
}

function navLinks(items: NavItem[]): NavLink[] {
  return items.flatMap((item) => (item.children ? item.children : [item]));
}
