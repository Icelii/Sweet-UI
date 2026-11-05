import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { TONES } from '../ui-tones';

interface Variant {
  key: 'light' | 'solid' | 'outline' | 'dot';
  classes: string;
  title: TranslationKey;
  hint: TranslationKey;
}

const DEFAULT_TAGS = ['Angular', 'Tailwind', 'daisyUI', 'TypeScript', 'Signals'];

@Component({
  selector: 'app-badges-demo',
  imports: [TablerIcon, TranslatePipe],
  templateUrl: './badges-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgesDemo {
  protected readonly tones = TONES;

  protected readonly variants: Variant[] = [
    { key: 'light', classes: '', title: 'ui.badges.light', hint: 'ui.badges.lightHint' },
    { key: 'solid', classes: 'ui-badge-solid', title: 'ui.badges.solid', hint: 'ui.badges.solidHint' },
    { key: 'outline', classes: 'ui-badge-outline', title: 'ui.badges.outline', hint: 'ui.badges.outlineHint' },
    { key: 'dot', classes: 'ui-badge-dot', title: 'ui.badges.dot', hint: 'ui.badges.dotHint' },
  ];

  protected readonly withIcons: { label: TranslationKey; icon: TablerIconName; tone: string }[] = [
    { label: 'ui.badge.verified', icon: 'circle-check', tone: 'success' },
    { label: 'ui.badge.featured', icon: 'star', tone: 'warning' },
    { label: 'ui.badge.new', icon: 'bell', tone: 'primary' },
    { label: 'ui.badge.private', icon: 'lock', tone: 'neutral' },
    { label: 'ui.badge.error', icon: 'alert-triangle', tone: 'danger' },
  ];

  protected readonly people: { name: string; initials: string; status: TranslationKey; tone: string }[] = [
    { name: 'Ana López', initials: 'AL', status: 'ui.badge.online', tone: 'success' },
    { name: 'Carlos Ruiz', initials: 'CR', status: 'ui.badge.away', tone: 'warning' },
    { name: 'María Torres', initials: 'MT', status: 'ui.badge.busy', tone: 'danger' },
    { name: 'Jorge Méndez', initials: 'JM', status: 'ui.badge.offline', tone: 'neutral' },
  ];

  protected readonly sizes: { key: string; label: TranslationKey }[] = [
    { key: 'sm', label: 'ui.size.sm' },
    { key: '', label: 'ui.size.md' },
    { key: 'lg', label: 'ui.size.lg' },
  ];

  protected readonly tags = signal<string[]>([...DEFAULT_TAGS]);

  protected removeTag(tag: string): void {
    this.tags.update((tags) => tags.filter((item) => item !== tag));
  }

  protected resetTags(): void {
    this.tags.set([...DEFAULT_TAGS]);
  }

  protected sizeClass(size: string): string {
    return size ? `ui-badge-${size}` : '';
  }
}