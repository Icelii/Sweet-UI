import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationsPanel } from './components/notifications-panel/notifications-panel';
import { Sidebar } from './components/sidebar/sidebar';
import { Topbar } from './components/topbar/topbar';
import { LayoutState } from './layout-state';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Topbar, NotificationsPanel],
  templateUrl: './main-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LayoutState],
})
export class MainLayout {
  protected readonly layout = inject(LayoutState);
}