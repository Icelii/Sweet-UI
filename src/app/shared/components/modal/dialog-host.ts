import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { DialogRequest, DialogService } from './dialog.service';
import { Modal } from './modal';

const CONFIRM_CLASSES: Record<string, string> = {
  neutral: 'ui-btn-neutral',
  primary: '',
  success: 'ui-btn-success',
  warning: 'ui-btn-warning',
  danger: 'ui-btn-danger',
  info: 'ui-btn-info',
};

/** Renders the dialogs opened with `DialogService`. Place it once, in the layout. */
@Component({
  selector: 'app-dialog-host',
  imports: [Modal, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [open]="!!dialog.current()"
      (openChange)="!$event && dialog.close(false)"
      [title]="request()?.title ?? ''"
      [icon]="request()?.icon ?? (request()?.kind === 'alert' ? 'info-circle' : 'alert-triangle')"
      [tone]="tone()"
      layout="centered"
      size="sm"
    >
      @if (request()?.message; as message) {
        <p class="text-[14px] text-(--secondary-text) whitespace-pre-line">{{ message }}</p>
      }
      <ng-container modalActions>
        @if (request()?.kind === 'confirm') {
          <button type="button" class="ui-btn ui-btn-default" (click)="dialog.close(false)">
            {{ request()?.cancelText ?? ('common.cancel' | translate) }}
          </button>
        }
        <button type="button" class="ui-btn {{ confirmClass() }}" (click)="dialog.close(true)">
          {{ request()?.confirmText ?? ((request()?.kind === 'alert' ? 'common.accept' : 'common.confirm') | translate) }}
        </button>
      </ng-container>
    </app-modal>
  `,
})
export class DialogHost {
  protected readonly dialog = inject(DialogService);
  /** Keeps the last dialog's content while it animates out. */
  protected readonly request = linkedSignal<DialogRequest | null, DialogRequest | null>({
    source: this.dialog.current,
    computation: (current, previous) => current ?? previous?.value ?? null,
  });
  protected readonly tone = computed(() => this.request()?.tone ?? 'primary');
  protected readonly confirmClass = computed(() => CONFIRM_CLASSES[this.tone()]);
}