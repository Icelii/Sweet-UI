import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';

/**
 * Translated validation errors for a reactive form control, shown once it is touched or changed.
 *
 * <app-error-messages [control]="form.controls.email" [label]="'Email'" />
 *
 * - label: field name used in "<label> is required".
 * - gender: 'f' uses the feminine form of "required" in Spanish.
 * - unit: unit added to min / max values, e.g. "kg".
 * - messageFormat: custom text for `pattern` errors, e.g. the password rules.
 * Add new error keys in messagesFor() and their texts under validation.* in translations.ts.
 */
@Component({
  selector: 'app-error-messages',
  templateUrl: './error-messages.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessages {
  private readonly i18n = inject(I18n);

  readonly control = input<AbstractControl | null>(null);
  readonly label = input('');
  readonly gender = input<'m' | 'f'>('m');
  readonly unit = input('');
  readonly messageFormat = input('');

  /** The control object stays the same while its state changes, so its events bump this counter. */
  private readonly changes = signal(0);

  protected readonly messages = computed(() => {
    this.changes();
    const control = this.control();
    if (!control?.errors || !control.invalid || !(control.dirty || control.touched)) return [];
    return this.messagesFor(control.errors);
  });

  constructor() {
    effect((onCleanup) => {
      const subscription = this.control()?.events.subscribe(() => this.changes.update((count) => count + 1));
      onCleanup(() => subscription?.unsubscribe());
    });
  }

  private messagesFor(errors: ValidationErrors): string[] {
    const t = this.i18n.t.bind(this.i18n);
    const unit = this.unit() ? ' ' + this.unit() : '';
    const custom = this.messageFormat().trim();
    const messages: string[] = [];

    if (errors['required']) messages.push(t(this.gender() === 'f' ? 'validation.requiredF' : 'validation.required', { label: this.label() }));
    if (errors['email']) messages.push(t('validation.email'));
    if (errors['pattern']) messages.push(custom || t('validation.pattern'));
    if (errors['minlength']) messages.push(t('validation.minLength', { length: errors['minlength'].requiredLength }));
    if (errors['maxlength']) messages.push(t('validation.maxLength', { length: errors['maxlength'].requiredLength }));
    if (errors['min']) messages.push(t('validation.min', { value: errors['min'].min + unit }));
    if (errors['max']) messages.push(t('validation.max', { value: errors['max'].max + unit }));
    if (errors['noMatch']) messages.push(t('validation.noMatch'));
    if (errors['minimumAge']) messages.push(t('validation.minimumAge', { age: errors['minimumAge'].requiredAge }));
    if (errors['hourInPast']) messages.push(t('validation.hourInPast'));
    if (errors['fileType']) messages.push(t('validation.fileType'));
    if (errors['invalidFile']) messages.push(t('validation.invalidFile'));
    if (errors['maxSize']) messages.push(t('validation.maxSize'));
    if (errors['emailOrPhone']) messages.push(t('validation.emailOrPhone'));
    if (errors['profanity']) messages.push(t('validation.profanity'));
    if (errors['clabeFormat']) messages.push(custom || t('validation.clabeFormat'));
    if (errors['clabeInvalid']) messages.push(t('validation.clabeInvalid'));
    if (errors['rfcInvalid']) messages.push(t('validation.rfcInvalid'));

    return messages;
  }
}
