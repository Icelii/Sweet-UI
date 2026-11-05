import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Language } from '@core/i18n/i18n';

/**
 * Round flag for a language in the language menus. When you add a language to I18n,
 * add its flag here as another @case.
 *
 * <app-flag-icon language="es" [size]="18" />
 */
@Component({
  selector: 'app-flag-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0 overflow-hidden rounded-full', 'aria-hidden': 'true' },
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()">
      @switch (language()) {
        @case ('es') {
          <rect width="8" height="24" fill="#006847" />
          <rect x="8" width="8" height="24" fill="#ffffff" />
          <rect x="16" width="8" height="24" fill="#ce1126" />
          <circle cx="12" cy="12" r="2.4" fill="#8c5a2b" />
        }
        @case ('en') {
          <rect width="24" height="24" fill="#ffffff" />
          @for (y of usStripes; track y) {
            <rect [attr.y]="y" width="24" height="1.85" fill="#b22234" />
          }
          <rect width="11" height="13" fill="#3c3b6e" />
        }
      }
    </svg>
  `,
})
export class FlagIcon {
  readonly language = input.required<Language>();
  readonly size = input(16);

  protected readonly usStripes = Array.from({ length: 7 }, (_, i) => +((i * 2 * 24) / 13).toFixed(2));
}