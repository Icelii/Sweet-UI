import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar, AvatarStatus } from '@shared/components/avatar/avatar';
import { Dropdown, DropdownItem, DropdownTrigger } from '@shared/components/dropdown/dropdown';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

interface NavRow {
  key: string;
  label: TranslationKey;
  icon: TablerIconName;
  count?: number;
}

interface Member {
  name: string;
  email: string;
  role: TranslationKey;
  status: AvatarStatus;
}

interface Task {
  id: number;
  label: TranslationKey;
  done: boolean;
}

@Component({
  selector: 'app-lists-demo',
  imports: [LowerCasePipe, Avatar, Dropdown, DropdownTrigger, DropdownItem, TablerIcon, TranslatePipe],
  templateUrl: './lists-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListsDemo {
  protected readonly basic: TranslationKey[] = ['ui.lists.item1', 'ui.lists.item2', 'ui.lists.item3', 'ui.lists.item4'];

  protected readonly nav: NavRow[] = [
    { key: 'inbox', label: 'ui.badges.inbox', icon: 'inbox', count: 12 },
    { key: 'starred', label: 'ui.badge.featured', icon: 'star', count: 3 },
    { key: 'sent', label: 'ui.lists.sent', icon: 'send' },
    { key: 'archive', label: 'ui.dropdowns.archive', icon: 'archive' },
    { key: 'trash', label: 'ui.lists.trash', icon: 'trash' },
  ];
  protected readonly current = signal('inbox');

  protected readonly members: Member[] = [
    { name: 'Lizeth Juarez', email: 'lizeth@sweetui.dev', role: 'ui.modals.role.admin', status: 'online' },
    { name: 'Jaret González', email: 'jaret@sweetui.dev', role: 'ui.modals.role.editor', status: 'away' },
    { name: 'Fernando Zapata', email: 'fernando@sweetui.dev', role: 'ui.modals.role.editor', status: 'busy' },
    { name: 'Diego Hernandez', email: 'diego@sweetui.dev', role: 'ui.modals.role.viewer', status: 'offline' },
  ];

  protected readonly tasks = signal<Task[]>([
    { id: 1, label: 'ui.lists.task1', done: true },
    { id: 2, label: 'ui.lists.task2', done: false },
    { id: 3, label: 'ui.lists.task3', done: false },
    { id: 4, label: 'ui.lists.task4', done: true },
  ]);

  protected toggleTask(id: number): void {
    this.tasks.update((list) => list.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  protected doneCount(): number {
    return this.tasks().filter((task) => task.done).length;
  }

  protected readonly plan = signal('pro');
  protected readonly plans: { key: string; label: TranslationKey; hint: TranslationKey; price: string }[] = [
    { key: 'basic', label: 'ui.lists.plan.basic', hint: 'ui.lists.plan.basicHint', price: '$0' },
    { key: 'pro', label: 'ui.lists.plan.pro', hint: 'ui.lists.plan.proHint', price: '$19' },
    { key: 'team', label: 'ui.lists.plan.team', hint: 'ui.lists.plan.teamHint', price: '$49' },
  ];

  protected readonly tones: { key: string; label: TranslationKey; icon: TablerIconName }[] = [
    { key: 'success', label: 'ui.lists.tone.success', icon: 'circle-check' },
    { key: 'warning', label: 'ui.lists.tone.warning', icon: 'alert-triangle' },
    { key: 'danger', label: 'ui.lists.tone.danger', icon: 'close' },
    { key: 'info', label: 'ui.lists.tone.info', icon: 'info-circle' },
  ];

  protected readonly stats: { label: TranslationKey; value: string }[] = [
    { label: 'ui.lists.stat.orders', value: '1,284' },
    { label: 'ui.lists.stat.customers', value: '312' },
    { label: 'ui.lists.stat.revenue', value: '$48.2k' },
  ];

  protected readonly features: TranslationKey[] = ['ui.modals.feature1', 'ui.modals.feature2', 'ui.modals.feature3', 'ui.lists.feature4'];
  protected readonly steps: { title: TranslationKey; hint: TranslationKey }[] = [
    { title: 'ui.lists.step1', hint: 'ui.lists.step1Hint' },
    { title: 'ui.lists.step2', hint: 'ui.lists.step2Hint' },
    { title: 'ui.lists.step3', hint: 'ui.lists.step3Hint' },
  ];
  protected readonly details: { term: TranslationKey; value: string }[] = [
    { term: 'tables.order.id', value: '#SW-20481' },
    { term: 'tables.order.customer', value: 'Jaret González' },
    { term: 'tables.order.date', value: '02/11/2026' },
    { term: 'tables.order.total', value: '$1,240.00' },
  ];
}