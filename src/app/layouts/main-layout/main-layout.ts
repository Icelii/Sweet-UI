import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { DialogHost } from '@shared/components/modal/dialog-host';
import { ChatLauncher } from './components/chat-launcher/chat-launcher';
import { NotificationsPanel } from './components/notifications-panel/notifications-panel';
import { Sidebar } from './components/sidebar/sidebar';
import { Topbar } from './components/topbar/topbar';
import { LayoutState } from './layout-state';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Topbar, NotificationsPanel, DialogHost, ChatLauncher],
  templateUrl: './main-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LayoutState],
})
export class MainLayout {
  protected readonly layout = inject(LayoutState);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    // Pages scroll inside <main>, so start each new page at the top.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => (this.content().nativeElement.scrollTop = 0));
  }
}