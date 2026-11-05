import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Progress, ProgressRing, ProgressSize, ProgressTone } from '@shared/components/progress/progress';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { TONES } from '../ui-tones';

interface Upload {
  name: string;
  size: string;
  icon: TablerIconName;
  progress: number;
}

const UPLOADS: Upload[] = [
  { name: 'Catalogo-otono-2026.pdf', size: '4.8 MB', icon: 'file-text', progress: 0 },
  { name: 'Banner-principal.png', size: '1.2 MB', icon: 'photo', progress: 0 },
  { name: 'Inventario.zip', size: '18 MB', icon: 'archive', progress: 0 },
];

@Component({
  selector: 'app-progress-demo',
  imports: [DecimalPipe, Progress, ProgressRing, TablerIcon, TranslatePipe],
  templateUrl: './progress-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressDemo {
  protected readonly tones = TONES as { key: ProgressTone; label: TranslationKey }[];
  protected readonly toneValues = [72, 58, 90, 45, 30, 64, 80];
  protected readonly sizes: { key: ProgressSize; label: TranslationKey }[] = [
    { key: 'xs', label: 'ui.size.xs' },
    { key: 'sm', label: 'ui.size.sm' },
    { key: 'md', label: 'ui.size.md' },
    { key: 'lg', label: 'ui.size.lg' },
  ];

  // Interactive value
  protected readonly value = signal(40);

  protected step(delta: number): void {
    this.value.update((value) => Math.min(100, Math.max(0, value + delta)));
  }

  // Storage (stacked)
  protected readonly storage: { label: TranslationKey; gb: number; tone: string }[] = [
    { label: 'ui.progress.storage.photos', gb: 42, tone: 'primary' },
    { label: 'ui.progress.storage.docs', gb: 18, tone: 'secondary' },
    { label: 'ui.progress.storage.videos', gb: 26, tone: 'warning' },
  ];
  protected readonly storageTotal = 128;
  protected readonly storageUsed = this.storage.reduce((sum, item) => sum + item.gb, 0);

  // Fake uploads
  protected readonly uploads = signal<Upload[]>(UPLOADS.map((item) => ({ ...item })));
  protected readonly uploading = signal(false);
  protected readonly allDone = computed(() => this.uploads().every((item) => item.progress >= 100));
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected toggleUpload(): void {
    if (this.uploading()) {
      this.stopUpload();
      return;
    }
    if (this.allDone()) this.uploads.set(UPLOADS.map((item) => ({ ...item })));
    this.uploading.set(true);
    this.timer = setInterval(() => {
      this.uploads.update((list) =>
        list.map((item, index) => ({ ...item, progress: Math.min(100, item.progress + (3 - index) * 2 + Math.random() * 4) })),
      );
      if (this.allDone()) this.stopUpload();
    }, 200);
  }

  private stopUpload(): void {
    clearInterval(this.timer);
    this.uploading.set(false);
  }

  // Goals (rings)
  protected readonly goals: { label: TranslationKey; value: number; tone: ProgressTone; detail: string }[] = [
    { label: 'ui.progress.goal.sales', value: 82, tone: 'success', detail: '$41k / $50k' },
    { label: 'ui.progress.goal.orders', value: 64, tone: 'primary', detail: '640 / 1,000' },
    { label: 'ui.progress.goal.tickets', value: 35, tone: 'warning', detail: '35 / 100' },
  ];
}