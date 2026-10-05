import { Injectable, signal } from '@angular/core';

@Injectable()
export class LayoutState {
  readonly isExpanded = signal(true);
  readonly mobileOpen = signal(false);
  readonly notificationsOpen = signal(false);

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
}