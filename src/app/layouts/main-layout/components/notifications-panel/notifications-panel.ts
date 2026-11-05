import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { LayoutState } from '@layouts/main-layout/layout-state';

@Component({
  selector: 'app-notifications-panel',
  imports: [TablerIcon, InitialsPipe, TranslatePipe],
  templateUrl: './notifications-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPanel {
  protected readonly layout = inject(LayoutState);

  protected readonly notifications = this.layout.notifications;
  protected readonly unreadCount = this.layout.unreadCount;

  protected markAllAsRead(): void {
    this.layout.markAllNotificationsAsRead();
  }

  protected markAsRead(id: number): void {
    this.layout.markNotificationAsRead(id);
  }
}
