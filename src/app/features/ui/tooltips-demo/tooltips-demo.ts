import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar } from '@shared/components/avatar/avatar';
import { Popover, PopoverTrigger } from '@shared/components/popover/popover';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { Tooltip, TooltipTone } from '@shared/components/tooltip/tooltip';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { FloatingPlacement } from '@shared/utils/floating';

@Component({
  selector: 'app-tooltips-demo',
  imports: [LowerCasePipe, Tooltip, Popover, PopoverTrigger, Avatar, TablerIcon, TranslatePipe],
  templateUrl: './tooltips-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipsDemo {
  private readonly i18n = inject(I18n);

  protected readonly placements: { key: FloatingPlacement; label: TranslationKey; icon: TablerIconName }[] = [
    { key: 'top', label: 'ui.tooltips.top', icon: 'chevron-up' },
    { key: 'right', label: 'ui.tooltips.right', icon: 'chevron-right' },
    { key: 'bottom', label: 'ui.tooltips.bottom', icon: 'chevron-down' },
    { key: 'left', label: 'ui.tooltips.left', icon: 'chevron-left' },
  ];

  protected readonly tones: { key: TooltipTone; label: TranslationKey; btn: string }[] = [
    { key: 'dark', label: 'ui.tooltips.dark', btn: 'ui-btn-neutral' },
    { key: 'light', label: 'ui.tooltips.light', btn: 'ui-btn-neutral' },
    { key: 'primary', label: 'ui.tone.primary', btn: '' },
    { key: 'success', label: 'ui.tone.success', btn: 'ui-btn-success' },
    { key: 'warning', label: 'ui.tone.warning', btn: 'ui-btn-warning' },
    { key: 'danger', label: 'ui.tone.danger', btn: 'ui-btn-danger' },
  ];

  protected readonly toolbar: { icon: TablerIconName; label: TranslationKey; shortcut: string }[] = [
    { icon: 'bold', label: 'ui.tooltips.bold', shortcut: 'Ctrl B' },
    { icon: 'italic', label: 'ui.tooltips.italic', shortcut: 'Ctrl I' },
    { icon: 'underline', label: 'ui.tooltips.underline', shortcut: 'Ctrl U' },
    { icon: 'list-numbers', label: 'ui.tooltips.list', shortcut: 'Ctrl ⇧ 7' },
    { icon: 'link', label: 'ui.tooltips.link', shortcut: 'Ctrl K' },
    { icon: 'photo', label: 'ui.tooltips.image', shortcut: '' },
  ];

  protected readonly team = ['Lizeth Juarez', 'Jaret González', 'Fernando Zapata', 'Israel De La Rosa', 'José Durán'];

  // Copy with feedback
  protected readonly copied = signal(false);
  protected readonly link = 'https://sweetui.dev/invite/7F3K-92QX';

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(this.link);
    } catch {}
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1600);
  }

  protected tip(label: TranslationKey, shortcut: string): string {
    const text = this.i18n.t(label);
    return shortcut ? `${text} (${shortcut})` : text;
  }

  // Popover: rename
  protected readonly projectName = signal('Campaña de otoño');
  protected readonly draftName = signal('');

  // Popover: delete confirm
  protected readonly deleted = signal(false);
}