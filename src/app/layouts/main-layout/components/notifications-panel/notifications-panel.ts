import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { LayoutNotification } from '@layouts/interfaces/layout';
import { LayoutState } from '@layouts/main-layout/layout-state';

@Component({
  selector: 'app-notifications-panel',
  imports: [TablerIcon, InitialsPipe, TranslatePipe],
  templateUrl: './notifications-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPanel {
  protected readonly layout = inject(LayoutState);

  protected readonly notifications = signal<LayoutNotification[]>([
    { id: 1, author: 'Ana López', message: 'notifications.newOrder', time: { key: 'time.minutesAgo', params: { count: 5 } }, read: false },
    { id: 2, author: 'Carlos Ruiz', message: 'notifications.reviewPending', time: { key: 'time.minutesAgo', params: { count: 32 } }, read: false },
    { id: 3, author: 'María Fernanda Torres', message: 'notifications.couponExpiring', time: { key: 'time.hoursAgo', params: { count: 2 } }, read: false },
    { id: 4, author: 'Jorge Méndez', message: 'notifications.lowStock', time: { key: 'time.hoursAgo', params: { count: 6 } }, read: false },
    { id: 5, author: 'Lucía Herrera', message: 'notifications.newUser', time: { key: 'time.yesterday' }, read: false },
  ]);

  protected readonly unreadCount = computed(() => this.notifications().filter((notification) => !notification.read).length);

  protected markAllAsRead(): void {
    this.notifications.update((list) => list.map((notification) => ({ ...notification, read: true })));
  }

  protected markAsRead(id: number): void {
    this.notifications.update((list) =>
      list.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    );
  }
}