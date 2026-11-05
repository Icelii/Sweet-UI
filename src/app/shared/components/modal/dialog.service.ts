import { Injectable, signal } from '@angular/core';
import { TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { ModalTone } from './modal';

export interface DialogOptions {
  /** Plain text, already translated. */
  title: string;
  message?: string;
  icon?: TablerIconName;
  tone?: ModalTone;
  confirmText?: string;
  cancelText?: string;
}

export interface DialogRequest extends DialogOptions {
  kind: 'confirm' | 'alert';
  resolve: (confirmed: boolean) => void;
}

/**
 * Opens confirmation and alert dialogs from code. Needs `<app-dialog-host />` once in the layout.
 * ```ts
 * if (await this.dialog.confirm({ title: 'Delete?', tone: 'danger', icon: 'trash' })) { ... }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly current = signal<DialogRequest | null>(null);

  /** Resolves `true` when the user confirms and `false` when they cancel or close it. */
  confirm(options: DialogOptions): Promise<boolean> {
    return this.open({ ...options, kind: 'confirm' });
  }

  /** A message with a single button. Resolves when it closes. */
  alert(options: DialogOptions): Promise<void> {
    return this.open({ ...options, kind: 'alert' }).then(() => undefined);
  }

  close(confirmed: boolean): void {
    const request = this.current();
    if (!request) return;
    this.current.set(null);
    request.resolve(confirmed);
  }

  private open(options: Omit<DialogRequest, 'resolve'>): Promise<boolean> {
    // Only one dialog at a time: a new one cancels the previous one.
    this.close(false);
    return new Promise((resolve) => this.current.set({ ...options, resolve }));
  }
}