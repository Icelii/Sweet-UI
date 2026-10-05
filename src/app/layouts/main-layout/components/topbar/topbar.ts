import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { LayoutState } from '@layouts/main-layout/layout-state';
import { ThemeToggle } from '@layouts/main-layout/components/theme-toggle/theme-toggle';
import { UserMenu } from '@layouts/main-layout/components/user-menu/user-menu';

@Component({
  selector: 'app-topbar',
  imports: [NgClass, NgTemplateOutlet, TablerIcon, TranslatePipe, ThemeToggle, UserMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (isDesktop()) {
      <header class="sticky top-0 z-20 hidden h-16 px-8 lg:flex justify-between items-center bg-base-100 border-b border-(--border-color-1)/40 shrink-0">
        <ng-container *ngTemplateOutlet="actions" />
      </header>
    } @else {
      <header class="lg:hidden shrink-0 z-20 flex items-center justify-between bg-base-100 backdrop-blur-md border-b border-(--border-color-1) px-4 h-16">
        <button (click)="layout.toggleMobileSidebar()" class="p-2 -ml-2 rounded-xl hover:bg-(--button-bg) text-(--secondary-text) transition duration-150" [attr.aria-label]="'layout.openMenu' | translate">
          <app-tabler-icon name="menu" [size]="28" />
        </button>
        <ng-container *ngTemplateOutlet="actions" />
      </header>
    }

    <ng-template #actions>
      <div class="flex items-center gap-2 ml-auto">
        <app-theme-toggle [buttonClass]="isDesktop() ? 'shadow-none bg-transparent' : 'bg-base-100'" />

        <button (click)="layout.toggleNotifications()" class="btn btn-circle border-2 border-(--border-color-1)/40 text-(--secondary-text) hover:text-(--primary-color)" [ngClass]="isDesktop() ? 'shadow-none bg-transparent' : 'bg-base-100'" [attr.aria-label]="'layout.notifications' | translate">
          <app-tabler-icon name="bell" />
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