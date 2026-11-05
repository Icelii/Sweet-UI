import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18n, Language } from '@core/i18n/i18n';
import { FlagIcon } from '@shared/components/flag-icon/flag-icon';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { LayoutUser } from '@layouts/main-layout/interfaces/layout';
import { FallbackImage } from '@shared/directives/fallback-image';

@Component({
  selector: 'app-user-menu',
  imports: [RouterLink, RouterLinkActive, FlagIcon, TablerIcon, InitialsPipe, TranslatePipe, FallbackImage],
  templateUrl: './user-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Block-level flex so the avatar centers with the 40px buttons instead of sitting on the text baseline.
  host: { class: 'flex items-center' },
})
export class UserMenu {
  protected readonly i18n = inject(I18n);
  private readonly document = inject(DOCUMENT);

  readonly variant = input<'mobile' | 'desktop'>('desktop');
  protected readonly isDesktop = computed(() => this.variant() === 'desktop');

  // Sample user: replace it with the signed-in user from your auth service.
  protected readonly user = signal<LayoutUser>({ name: 'Iceli', role: 'user.role.admin', img: 'https://i.pinimg.com/1200x/c5/31/23/c531234b590d2192691fa65ec66404bb.jpg' });

  protected readonly languageNames: Record<Language, string> = { es: 'Español', en: 'English' };
  protected readonly languageMenuOpen = signal(false);

  /** The daisyUI dropdown stays open while it holds focus, so dropping focus closes it. */
  protected closeMenu(): void {
    this.languageMenuOpen.set(false);
    (this.document.activeElement as HTMLElement | null)?.blur();
  }

  protected toggleLanguageMenu(): void {
    this.languageMenuOpen.update((value) => !value);
  }

  protected selectLanguage(language: Language): void {
    this.i18n.setLanguage(language);
    this.languageMenuOpen.set(false);
  }
}