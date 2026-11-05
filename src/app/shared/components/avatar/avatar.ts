import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { InitialsPipe } from '@shared/pipes/initials-pipe';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded';
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';
/** `auto` picks a stable color from the name, so each person keeps the same color. */
export type AvatarTone = 'auto' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const AUTO_TONES: Exclude<AvatarTone, 'auto' | 'neutral'>[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];

const ICON_SIZES: Record<AvatarSize, number> = { xs: 14, sm: 16, md: 20, lg: 24, xl: 30, '2xl': 40 };

const STATUS_LABELS: Record<AvatarStatus, TranslationKey> = {
  online: 'ui.badge.online',
  away: 'ui.badge.away',
  busy: 'ui.badge.busy',
  offline: 'ui.badge.offline',
};

const initials = new InitialsPipe();

/**
 * Shows a photo, falling back to the initials and then to an icon when the image fails or is missing.
 * ```html
 * <app-avatar name="Ana López" src="/ana.jpg" size="lg" status="online" />
 * <div class="ui-avatar-group">
 *   <app-avatar name="Ana López" />
 *   <span class="ui-avatar ui-avatar-neutral">+3</span>
 * </div>
 * ```
 */
@Component({
  selector: 'app-avatar',
  imports: [TablerIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[class]': 'classes()',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'name() || null',
  },
  template: `
    @if (showImage()) {
      <img [src]="src()" alt="" class="ui-avatar-img" (error)="failed.set(true)" />
    } @else if (name()) {
      <span aria-hidden="true">{{ initials() }}</span>
    } @else {
      <app-tabler-icon [name]="icon()" [size]="iconSize()" />
    }
    @if (status(); as status) {
      <span class="ui-avatar-status ui-avatar-status-{{ status }}" aria-hidden="true"></span>
    }
  `,
})
export class Avatar {
  private readonly i18n = inject(I18n);

  readonly name = input<string | null>();
  readonly src = input<string | null>();
  readonly size = input<AvatarSize>('md');
  readonly shape = input<AvatarShape>('circle');
  readonly tone = input<AvatarTone>('auto');
  readonly solid = input(false);
  readonly ring = input(false);
  readonly status = input<AvatarStatus | null>();
  /** Shown when there is neither a photo nor a name. */
  readonly icon = input<TablerIconName>('user');

  /** Resets whenever `src` changes, so a new photo gets a fresh try. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });

  protected readonly showImage = computed(() => !!this.src() && !this.failed());
  protected readonly initials = computed(() => initials.transform(this.name()));
  protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);

  private readonly resolvedTone = computed(() => {
    const tone = this.tone();
    if (tone !== 'auto') return tone;
    const name = this.name();
    if (!name) return 'neutral';
    let hash = 0;
    for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return AUTO_TONES[Math.abs(hash) % AUTO_TONES.length];
  });

  protected readonly classes = computed(() =>
    [
      'ui-avatar',
      `ui-avatar-${this.size()}`,
      `ui-avatar-${this.resolvedTone()}`,
      this.shape() === 'rounded' ? 'ui-avatar-rounded' : '',
      this.solid() ? 'ui-avatar-solid' : '',
      this.ring() ? 'ui-avatar-ring' : '',
    ].join(' '),
  );

  protected readonly label = computed(() => {
    const name = this.name() || this.i18n.t('user.defaultName');
    const status = this.status();
    return status ? `${name} · ${this.i18n.t(STATUS_LABELS[status])}` : name;
  });
}