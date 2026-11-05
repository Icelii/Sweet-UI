import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, ElementRef, input, model, viewChild } from '@angular/core';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

export type ModalTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
/** `default`: icon and title on one row. `centered`: big icon on top, for confirmations and alerts. */
export type ModalLayout = 'default' | 'centered';

const TONE_CLASSES: Record<ModalTone, string> = {
  neutral: 'bg-(--button-bg) text-(--secondary-text) border-(--border-color-1)/40',
  primary: 'bg-(--primary-color)/10 text-(--primary-color) border-(--primary-color)/20',
  success: 'bg-success/15 text-success border-success/25',
  warning: 'bg-warning/15 text-warning border-warning/25',
  danger: 'bg-(--danger)/10 text-(--danger) border-(--danger)/20',
  info: 'bg-info/15 text-info border-info/25',
};

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
  full: 'sm:max-w-[calc(100vw-4rem)] sm:h-[calc(100dvh-4rem)]',
};

/**
 * Native `<dialog>` modal with header (icon, title, subtitle, close button), body and actions footer.
 *
 * Body content goes in the default slot; footer buttons go in `[modalActions]` (the footer hides when empty).
 * On phones it opens as a bottom sheet; from `sm` up it is centered.
 * ```html
 * <app-modal [(open)]="isOpen" title="Title" icon="lock">
 *   <p>Body</p>
 *   <ng-container modalActions><button>Save</button></ng-container>
 * </app-modal>
 * ```
 */
@Component({
  selector: 'app-modal',
  imports: [NgTemplateOutlet, TablerIcon, TranslatePipe],
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly open = model(false);
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly icon = input<TablerIconName>();
  readonly tone = input<ModalTone>('neutral');
  readonly size = input<ModalSize>('md');
  readonly layout = input<ModalLayout>('default');
  /** Prevents closing (close button, Esc and backdrop), e.g. while a request is in flight. */
  readonly locked = input(false);
  readonly closeOnBackdrop = input(true);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly toneClasses = TONE_CLASSES;
  protected readonly sizeClasses = SIZE_CLASSES;

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) dialog.showModal();
      if (!this.open() && dialog.open) dialog.close();
    });
  }

  close(): void {
    if (!this.locked()) this.open.set(false);
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop()) this.close();
  }
}