import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar } from '@shared/components/avatar/avatar';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

type StepState = 'done' | 'current' | 'pending';

interface Step {
  title: TranslationKey;
  time: string;
  icon: TablerIconName;
  state: StepState;
}

@Component({
  selector: 'app-timelines-demo',
  imports: [Avatar, TablerIcon, TranslatePipe],
  templateUrl: './timelines-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelinesDemo {
  protected readonly order: Step[] = [
    { title: 'ui.timelines.order.placed', time: '01 nov · 10:24', icon: 'shopping-cart', state: 'done' },
    { title: 'ui.timelines.order.paid', time: '01 nov · 10:26', icon: 'credit-card', state: 'done' },
    { title: 'ui.timelines.order.shipped', time: '02 nov · 09:10', icon: 'truck', state: 'current' },
    { title: 'ui.timelines.order.delivered', time: '—', icon: 'home', state: 'pending' },
  ];

  protected readonly activity: { name: string; text: TranslationKey; time: string; tone: string; icon: TablerIconName }[] = [
    { name: 'Lizeth Juarez', text: 'ui.timelines.act.published', time: '10 min', tone: 'primary', icon: 'send' },
    { name: 'Jaret González', text: 'ui.timelines.act.approved', time: '1 h', tone: 'success', icon: 'circle-check' },
    { name: 'Fernando Zapata', text: 'ui.timelines.act.commented', time: '3 h', tone: 'info', icon: 'reviews' },
    { name: 'Diego Hernandez', text: 'ui.timelines.act.deleted', time: '1 d', tone: 'danger', icon: 'trash' },
  ];

  protected readonly milestones: { year: string; title: TranslationKey; text: TranslationKey; icon: TablerIconName; tone: string }[] = [
    { year: '2022', title: 'ui.timelines.ms.idea', text: 'ui.timelines.ms.ideaText', icon: 'bolt', tone: 'warning' },
    { year: '2023', title: 'ui.timelines.ms.launch', text: 'ui.timelines.ms.launchText', icon: 'rocket', tone: 'primary' },
    { year: '2024', title: 'ui.timelines.ms.team', text: 'ui.timelines.ms.teamText', icon: 'users', tone: 'secondary' },
    { year: '2026', title: 'ui.timelines.ms.global', text: 'ui.timelines.ms.globalText', icon: 'world', tone: 'success' },
  ];

  protected readonly shipping: Step[] = [
    { title: 'ui.timelines.ship.prepared', time: '01 nov', icon: 'orders', state: 'done' },
    { title: 'ui.timelines.ship.transit', time: '02 nov', icon: 'truck', state: 'done' },
    { title: 'ui.timelines.ship.city', time: '03 nov', icon: 'map-pin', state: 'current' },
    { title: 'ui.timelines.order.delivered', time: '04 nov', icon: 'home', state: 'pending' },
  ];

  protected readonly days: { label: TranslationKey; items: { title: TranslationKey; time: string; tone: string }[] }[] = [
    {
      label: 'ui.timelines.today',
      items: [
        { title: 'ui.timelines.ev.meeting', time: '09:00', tone: 'primary' },
        { title: 'ui.timelines.ev.deploy', time: '13:30', tone: 'success' },
      ],
    },
    {
      label: 'time.yesterday',
      items: [
        { title: 'ui.timelines.ev.review', time: '16:15', tone: 'warning' },
        { title: 'ui.timelines.ev.incident', time: '18:40', tone: 'danger' },
      ],
    },
  ];
}