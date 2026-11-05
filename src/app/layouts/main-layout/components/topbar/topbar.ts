import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { LayoutState } from '@layouts/main-layout/layout-state';
import { ThemeToggle } from '@shared/components/theme-toggle/theme-toggle';
import { UserMenu } from '@layouts/main-layout/components/user-menu/user-menu';
import { GlobalSearch } from '@layouts/main-layout/components/global-search/global-search';

@Component({
  selector: 'app-topbar',
  imports: [NgTemplateOutlet, TablerIcon, TranslatePipe, ThemeToggle, UserMenu, GlobalSearch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (isDesktop()) {
      <header class="sticky top-0 z-20 hidden h-16 px-8 lg:flex justify-between items-center bg-base-100 border-b border-(--border-color-1)/40 shrink-0">
        <app-global-search variant="desktop" />
        <ng-container *ngTemplateOutlet="actions" />
      </header>
    } @else {
      <header class="lg:hidden shrink-0 z-20 flex items-center justify-between bg-base-100 backdrop-blur-md border-b border-(--border-color-1) px-4 h-16">
        <button (click)="layout.toggleMobileSidebar()" class="size-11 inline-flex items-center justify-center shrink-0 -ml-2 rounded-xl hover:bg-(--button-bg) text-(--secondary-text) transition duration-150" [attr.aria-label]="'layout.openMenu' | translate">
          <app-tabler-icon name="menu" [size]="28" />
        </button>
        <ng-container *ngTemplateOutlet="actions" />
      </header>
    }

    <ng-template #actions>
      <div class="flex items-center gap-2 ml-auto">
        @if (!isDesktop()) {
          <app-global-search variant="mobile" />
        }
        <app-theme-toggle [buttonClass]="isDesktop() ? 'shadow-none bg-transparent' : 'bg-base-100'" />

        <button (click)="layout.toggleNotifications()" class="btn btn-circle relative border-2 border-(--border-color-1)/40 text-(--secondary-text) hover:text-(--primary-color)" [class]="isDesktop() ? 'shadow-none bg-transparent' : 'bg-base-100'" [attr.aria-label]="'layout.notifications' | translate">
          <app-tabler-icon name="bell" />
          @if (layout.unreadCount() > 0) {
            <span class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-error text-white text-[11px] font-bold leading-5 text-center ring-2 ring-base-100" aria-hidden="true">
              {{ layout.unreadCount() > 99 ? '99+' : layout.unreadCount() }}
            </span>
          }
        </button>

        <app-user-menu [variant]="variant()" />
      </div>
    </ng-template>
  `,
})
export class Topbar {
  protected readonly layout = inject(LayoutState);

  readonly variant = input<'mobile' | 'desktop'>('desktop');
  protected readonly isDesktop = computed(() => this.variant() === 'desktop');
}