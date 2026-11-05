import { Injectable, computed, signal } from '@angular/core';
import { LayoutNotification } from '@layouts/main-layout/interfaces/layout';

@Injectable()
export class LayoutState {
  readonly isExpanded = signal(true);
  readonly mobileOpen = signal(false);
  readonly notificationsOpen = signal(false);

  // Sample notifications: replace them with your API.
  readonly notifications = signal<LayoutNotification[]>([
    { id: 1, author: 'Ana López', message: 'notifications.newOrder', time: { key: 'time.minutesAgo', params: { count: 5 } }, read: false },
    { id: 2, author: 'Carlos Ruiz', message: 'notifications.reviewPending', time: { key: 'time.minutesAgo', params: { count: 32 } }, read: false },
    { id: 3, author: 'María Fernanda Torres', message: 'notifications.couponExpiring', time: { key: 'time.hoursAgo', params: { count: 2 } }, read: false },
    { id: 4, author: 'Jorge Méndez', message: 'notifications.lowStock', time: { key: 'time.hoursAgo', params: { count: 6 } }, read: false },
    { id: 5, author: 'Lucía Herrera', message: 'notifications.newUser', time: { key: 'time.yesterday' }, read: false },
  ]);

  readonly unreadCount = computed(() => this.notifications().filter((notification) => !notification.read).length);

  toggleSidebar(): void {
    this.isExpanded.update((value) => !value);
  }

  expandSidebar(): void {
    this.isExpanded.set(true);
  }

  toggleMobileSidebar(): void {
    this.mobileOpen.update((value) => !value);
    if (this.mobileOpen()) this.isExpanded.set(true);
  }

  closeMobileSidebar(): void {
    this.mobileOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((value) => !value);
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  markAllNotificationsAsRead(): void {
    this.notifications.update((list) => list.map((notification) => ({ ...notification, read: true })));
  }

  markNotificationAsRead(id: number): void {
    this.notifications.update((list) =>
      list.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    );
  }
}