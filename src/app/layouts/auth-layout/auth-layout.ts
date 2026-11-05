import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BRAND, brandLogo } from '@core/config/brand';
import { I18n, Language } from '@core/i18n/i18n';
import { Theme } from '@core/services/theme';
import { FlagIcon } from '@shared/components/flag-icon/flag-icon';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { ThemeToggle } from '@shared/components/theme-toggle/theme-toggle';
import { FallbackImage } from '@shared/directives/fallback-image';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, FlagIcon, TablerIcon, ThemeToggle, TranslatePipe, FallbackImage],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  private readonly document = inject(DOCUMENT);
  private readonly theme = inject(Theme);
  protected readonly i18n = inject(I18n);

  protected readonly currentYear = new Date().getFullYear();
  protected readonly languageNames: Record<Language, string> = { es: 'Español', en: 'English' };
  protected readonly brand = BRAND;
  protected readonly logo = computed(() => brandLogo(this.theme.isDark()));

  protected selectLanguage(language: Language): void {
    this.i18n.setLanguage(language);
    (this.document.activeElement as HTMLElement | null)?.blur();
  }
}