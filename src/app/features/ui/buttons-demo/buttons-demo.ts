import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { TONES } from '../ui-tones';

interface Variant {
  key: 'default' | 'solid' | 'light' | 'outline' | 'ghost' | 'link';
  title: TranslationKey;
  hint: TranslationKey;
}

interface IconAction {
  label: TranslationKey;
  icon: TablerIconName;
  tone: string;
}

@Component({
  selector: 'app-buttons-demo',
  imports: [TablerIcon, TranslatePipe],
  templateUrl: './buttons-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsDemo {
  protected readonly tones = TONES;

  protected readonly variants: Variant[] = [
    { key: 'solid', title: 'ui.buttons.solid', hint: 'ui.buttons.solidHint' },
    { key: 'light', title: 'ui.buttons.light', hint: 'ui.buttons.lightHint' },
    { key: 'outline', title: 'ui.buttons.outline', hint: 'ui.buttons.outlineHint' },
    { key: 'ghost', title: 'ui.buttons.ghost', hint: 'ui.buttons.ghostHint' },
    { key: 'link', title: 'ui.buttons.link', hint: 'ui.buttons.linkHint' },
  ];

  /** Variants shown in the states table (link has no box, so it is left out). */
  protected readonly stateVariants: Variant[] = [
    { key: 'default', title: 'ui.buttons.default', hint: 'ui.buttons.defaultHint' },
    ...this.variants.filter((variant) => variant.key !== 'link'),
  ];

  protected readonly states: { label: TranslationKey; classes: string; disabled?: boolean; loading?: boolean }[] = [
    { label: 'ui.state.default', classes: '' },
    { label: 'ui.state.hover', classes: 'is-hover' },
    { label: 'ui.state.focus', classes: 'is-focus' },
    { label: 'ui.state.pressed', classes: 'is-active' },
    { label: 'ui.state.loading', classes: '', loading: true },
    { label: 'ui.state.disabled', classes: '', disabled: true },
  ];

  protected readonly leadingActions: IconAction[] = [
    { label: 'ui.action.new', icon: 'plus', tone: 'primary' },
    { label: 'ui.action.download', icon: 'download', tone: 'secondary' },
    { label: 'ui.action.approve', icon: 'check', tone: 'success' },
    { label: 'ui.action.delete', icon: 'trash', tone: 'danger' },
  ];

  protected readonly trailingActions: IconAction[] = [
    { label: 'ui.action.continue', icon: 'arrow-right', tone: 'primary' },
    { label: 'ui.action.send', icon: 'send', tone: 'info' },
    { label: 'ui.action.options', icon: 'chevron-down', tone: 'neutral' },
  ];

  protected readonly iconActions: IconAction[] = [
    { label: 'ui.action.edit', icon: 'edit', tone: 'primary' },
    { label: 'ui.action.favorite', icon: 'heart', tone: 'danger' },
    { label: 'ui.action.rate', icon: 'star', tone: 'warning' },
    { label: 'ui.action.settings', icon: 'settings', tone: 'neutral' },
  ];

  protected readonly sizes: { key: string; label: TranslationKey }[] = [
    { key: 'xs', label: 'ui.size.xs' },
    { key: 'sm', label: 'ui.size.sm' },
    { key: '', label: 'ui.size.md' },
    { key: 'lg', label: 'ui.size.lg' },
  ];

  protected readonly periods: TranslationKey[] = ['ui.period.day', 'ui.period.week', 'ui.period.month', 'ui.period.year'];
  protected readonly period = signal<TranslationKey>('ui.period.week');

  // Live loading example
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);

  protected save(): void {
    if (this.saving()) return;
    this.saved.set(false);
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 1800);
    }, 1500);
  }

  protected sizeClass(size: string): string {
    return size ? `ui-btn-${size}` : '';
  }
}