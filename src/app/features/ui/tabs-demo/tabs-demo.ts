import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar } from '@shared/components/avatar/avatar';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { Tab, Tabs } from '@shared/components/tabs/tabs';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-tabs-demo',
  imports: [Tabs, Tab, Avatar, TablerIcon, TranslatePipe],
  templateUrl: './tabs-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDemo {
  protected readonly lineTab = signal<string | null>('overview');
  protected readonly period = signal<string | null>('week');
  protected readonly settingsTab = signal<string | null>('account');

  protected readonly periodData: Record<string, { revenue: string; orders: string; change: string }> = {
    day: { revenue: '$2,140', orders: '38', change: '+4%' },
    week: { revenue: '$14,820', orders: '264', change: '+12%' },
    month: { revenue: '$61,300', orders: '1,092', change: '+8%' },
    year: { revenue: '$702,900', orders: '12,480', change: '+21%' },
  };

  protected readonly many: TranslationKey[] = [
    'ui.tabs.many.all',
    'ui.tabs.many.pending',
    'ui.tabs.many.paid',
    'ui.tabs.many.shipped',
    'ui.tabs.many.delivered',
    'ui.tabs.many.returned',
    'ui.tabs.many.cancelled',
  ];

  protected readonly activity = [
    { name: 'Lizeth Juarez', text: 'ui.tabs.activity1' as TranslationKey, time: '10 min' },
    { name: 'Jaret González', text: 'ui.tabs.activity2' as TranslationKey, time: '1 h' },
    { name: 'Diego Hernandez', text: 'ui.tabs.activity3' as TranslationKey, time: '3 h' },
  ];

  protected readonly notifications = signal({ email: true, push: false, weekly: true });

  protected toggleNotification(key: 'email' | 'push' | 'weekly'): void {
    this.notifications.update((value) => ({ ...value, [key]: !value[key] }));
  }
}