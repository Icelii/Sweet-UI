import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18n, Language } from '@core/i18n/i18n';
import { FlagIcon } from '@shared/components/flag-icon/flag-icon';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { LayoutUser } from '@layouts/interfaces/layout';

@Component({
  selector: 'app-user-menu',
  imports: [NgClass, RouterLink, RouterLinkActive, FlagIcon, TablerIcon, InitialsPipe, TranslatePipe],
  templateUrl: './user-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenu {
  protected readonly i18n = inject(I18n);

  readonly variant = input<'mobile' | 'desktop'>('desktop');
  protected readonly isDesktop = computed(() => this.variant() === 'desktop');

  protected readonly user = signal<LayoutUser>({ name: 'Iceli', role: 'user.role.admin', img: 'https://iceliiprojects.s3.us-west-004.backblazeb2.com/643522234272995322.jpg' });

  protected readonly avatarFailed = signal(false);

  protected readonly languageNames: Record<Language, string> = { es: 'Español', en: 'English' };
  protected readonly languageMenuOpen = signal(false);

  protected toggleLanguageMenu(): void {
    this.languageMenuOpen.update((value) => !value);
  }

  protected selectLanguage(language: Language): void {
    this.i18n.setLanguage(language);
    this.languageMenuOpen.set(false);
  }
}