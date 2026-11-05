import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar } from '@shared/components/avatar/avatar';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { DialogService } from '@shared/components/modal/dialog.service';
import { Modal, ModalSize, ModalTone } from '@shared/components/modal/modal';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

interface AlertExample {
  tone: ModalTone;
  icon: TablerIconName;
  label: TranslationKey;
  title: TranslationKey;
  message: TranslationKey;
  confirm: TranslationKey;
  kind: 'confirm' | 'alert';
}

@Component({
  selector: 'app-modals-demo',
  imports: [ReactiveFormsModule, Modal, Avatar, ErrorMessages, TablerIcon, TranslatePipe],
  templateUrl: './modals-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalsDemo {
  private readonly dialog = inject(DialogService);
  private readonly i18n = inject(I18n);

  // Sizes
  protected readonly sizes: { key: ModalSize; label: TranslationKey }[] = [
    { key: 'sm', label: 'ui.size.sm' },
    { key: 'md', label: 'ui.size.md' },
    { key: 'lg', label: 'ui.size.lg' },
    { key: 'xl', label: 'ui.modals.sizeXl' },
    { key: 'full', label: 'ui.modals.sizeFull' },
  ];
  protected readonly sizeOpen = signal(false);
  protected readonly size = signal<ModalSize>('md');

  protected openSize(size: ModalSize): void {
    this.size.set(size);
    this.sizeOpen.set(true);
  }

  // Programmatic confirmations and alerts
  protected readonly alerts: AlertExample[] = [
    { tone: 'danger', icon: 'trash', label: 'ui.action.delete', title: 'ui.modals.deleteTitle', message: 'ui.modals.deleteBody', confirm: 'ui.action.delete', kind: 'confirm' },
    { tone: 'warning', icon: 'alert-triangle', label: 'ui.tone.warning', title: 'ui.modals.warningTitle', message: 'ui.modals.warningBody', confirm: 'ui.action.continue', kind: 'confirm' },
    { tone: 'success', icon: 'circle-check', label: 'ui.tone.success', title: 'ui.modals.successTitle', message: 'ui.modals.successBody', confirm: 'common.accept', kind: 'alert' },
    { tone: 'info', icon: 'info-circle', label: 'ui.tone.info', title: 'ui.modals.infoTitle', message: 'ui.modals.infoBody', confirm: 'common.accept', kind: 'alert' },
  ];
  protected readonly lastResult = signal<TranslationKey | null>(null);

  protected async openAlert(example: AlertExample): Promise<void> {
    const options = {
      title: this.i18n.t(example.title),
      message: this.i18n.t(example.message),
      icon: example.icon,
      tone: example.tone,
      confirmText: this.i18n.t(example.confirm),
    };
    if (example.kind === 'alert') {
      await this.dialog.alert(options);
      this.lastResult.set('ui.modals.resultClosed');
      return;
    }
    const confirmed = await this.dialog.confirm(options);
    this.lastResult.set(confirmed ? 'ui.modals.resultConfirmed' : 'ui.modals.resultCancelled');
  }

  // Form modal
  protected readonly formOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly invited = signal<{ name: string; email: string }[]>([]);
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    role: new FormControl('editor', { nonNullable: true }),
    message: new FormControl('', { nonNullable: true }),
  });

  protected openForm(): void {
    this.form.reset();
    this.formOpen.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    // Fake request so the locked state can be seen.
    setTimeout(() => {
      const { name, email } = this.form.getRawValue();
      this.invited.update((list) => [{ name, email }, ...list]);
      this.saving.set(false);
      this.formOpen.set(false);
    }, 1200);
  }

  // Long content and centered layout
  protected readonly termsOpen = signal(false);
  protected readonly termsSections = [1, 2, 3, 4, 5, 6];
  protected readonly accepted = signal(false);

  protected readonly centeredOpen = signal(false);
}