import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar, AvatarSize, AvatarStatus, AvatarTone } from '@shared/components/avatar/avatar';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { TONES } from '../ui-tones';

interface Person {
  name: string;
  role: string;
  photo?: string;
  status: AvatarStatus;
}

const TEAM: Person[] = [
  { name: 'Lizeth Juarez', role: 'Frontend Developer', photo: 'https://i.pinimg.com/736x/be/65/62/be65620512806aaf633548a506731ce4.jpg', status: 'online' },
  { name: 'Jaret González', role: 'Backend Developer', photo: 'https://i.pinimg.com/1200x/d8/b3/4e/d8b34e8f796640c7bee073a405974dca.jpg', status: 'away' },
  { name: 'Fernando Zapata', role: 'Backend Developer', photo:'https://i.pinimg.com/736x/17/74/98/177498066e5f021d9741b2965ec3b337.jpg', status: 'busy' },
  { name: 'Israel De La Rosa', role: 'Backend Developer', photo: 'https://i.pinimg.com/736x/d4/45/6d/d4456d403212575375496dbd150359c3.jpg', status: 'offline' },
  { name: 'José Durán', role: 'Frontend Developer', photo: 'https://i.pinimg.com/736x/60/b9/bc/60b9bc941fe3686b9a3728af0c73f4c7.jpg', status: 'online' },
  { name: 'Diego Hernandez', role: 'DevOps', status: 'online' },
  { name: 'Taisha González', role: 'Data Analyst', status: 'away' },
  { name: 'Luis Alvarado', role: 'Support', status: 'offline' },
];

@Component({
  selector: 'app-avatars-demo',
  imports: [Avatar, TablerIcon, TranslatePipe],
  templateUrl: './avatars-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarsDemo {
  protected readonly team = TEAM;
  protected readonly tones = TONES as { key: AvatarTone; label: TranslationKey }[];
  protected readonly sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  protected readonly statuses: { key: AvatarStatus; label: TranslationKey }[] = [
    { key: 'online', label: 'ui.badge.online' },
    { key: 'away', label: 'ui.badge.away' },
    { key: 'busy', label: 'ui.badge.busy' },
    { key: 'offline', label: 'ui.badge.offline' },
  ];

  /** Group: shows the first N and a "+rest" counter. */
  protected readonly groupMax = 5;
  protected readonly selected = signal<string>(TEAM[0].name);
}