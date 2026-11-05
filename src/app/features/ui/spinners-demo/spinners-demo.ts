import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar } from '@shared/components/avatar/avatar';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { TONES } from '../ui-tones';

@Component({
  selector: 'app-spinners-demo',
  imports: [Avatar, TablerIcon, TranslatePipe],
  templateUrl: './spinners-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnersDemo {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tones = TONES;
  protected readonly sizes: { key: string; label: TranslationKey }[] = [
    { key: 'xs', label: 'ui.size.xs' },
    { key: 'sm', label: 'ui.size.sm' },
    { key: 'md', label: 'ui.size.md' },
    { key: 'lg', label: 'ui.size.lg' },
    { key: 'xl', label: 'ui.modals.sizeXl' },
  ];
  protected readonly variants: { key: string; label: TranslationKey; spans: boolean }[] = [
    { key: '', label: 'ui.spinners.border', spans: false },
    { key: 'ui-spinner-dual', label: 'ui.spinners.dual', spans: false },
    { key: 'ui-spinner-grow', label: 'ui.spinners.grow', spans: false },
    { key: 'ui-spinner-dots', label: 'ui.spinners.dots', spans: true },
    { key: 'ui-spinner-bars', label: 'ui.spinners.bars', spans: true },
  ];

  protected readonly people = [
    { name: 'Lizeth Juarez', role: 'Frontend Developer' },
    { name: 'Jaret González', role: 'Backend Developer' },
    { name: 'Taisha González', role: 'Data Analyst' },
  ];

  // Buttons
  protected readonly saving = signal(false);
  protected readonly sending = signal(false);
  protected readonly refreshing = signal(false);

  protected fake(state: WritableSignal<boolean>, ms = 1600): void {
    if (state()) return;
    state.set(true);
    const timer = setTimeout(() => state.set(false), ms);
    this.destroyRef.onDestroy(() => clearTimeout(timer));
  }

  // Card overlay + skeleton
  protected readonly cardLoading = signal(true);
  protected readonly listLoading = signal(true);
}