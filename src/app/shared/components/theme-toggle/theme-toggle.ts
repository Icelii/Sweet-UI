import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Theme } from '@core/services/theme';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

/**
 * Round button that switches between light and dark (see the Theme service).
 *
 * <app-theme-toggle buttonClass="btn-sm" />
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [TablerIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button (click)="theme.toggle()" class="btn btn-circle swap swap-rotate border-2 border-(--border-color-1)/40 text-(--secondary-text) hover:text-(--primary-color)" [class]="buttonClass()" [class.swap-active]="theme.isDark()" [attr.aria-label]="'layout.toggleTheme' | translate">
      <app-tabler-icon class="swap-on" name="sun" [size]="22" />
      <app-tabler-icon class="swap-off" name="moon" [size]="22" />
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(Theme);

  readonly buttonClass = input('');
}