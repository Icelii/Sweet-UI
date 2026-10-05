import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Theme } from '@core/services/theme';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-theme-toggle',
  imports: [NgClass, TablerIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button (click)="theme.toggle()" class="btn btn-circle border-2 border-(--border-color-1)/40 text-(--secondary-text) hover:text-(--primary-color)" [ngClass]="buttonClass()" [attr.aria-label]="'layout.toggleTheme' | translate">
      <app-tabler-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="22" />
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(Theme);

  readonly buttonClass = input('');
}
