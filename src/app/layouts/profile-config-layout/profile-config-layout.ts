import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavItem } from '@core/interfaces/navigation';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-profile-config-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TablerIcon, TranslatePipe],
  templateUrl: './profile-config-layout.html',
  styleUrl: './profile-config-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileConfigLayout {
  protected readonly navItems: NavItem[] = [
    { path: '/account-settings/profile', label: 'accountSettings.nav.profile', icon: 'user-circle' },
  ];
}
