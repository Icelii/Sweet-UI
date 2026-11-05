import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { matchFieldsValidator } from '@shared/validators/match-fields.validator';

/** At least 8 characters with a lowercase, an uppercase, a number and a symbol. */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, ErrorMessages, TablerIcon, TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  /** Token from the link in the reset email (/auth/reset-password?token=…). */
  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token');

  protected readonly loading = signal(false);
  protected readonly completed = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly confirmPasswordVisible = signal(false);

  protected readonly resetForm = inject(FormBuilder).nonNullable.group(
    {
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      confirm_password: ['', [Validators.required]],
    },
    { validators: [matchFieldsValidator('password', 'confirm_password')] },
  );

  protected get f() {
    return this.resetForm.controls;
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible.update((visible) => !visible);
  }

  protected onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    // Demo only: send the new password and `this.token` to your API.
    this.completed.set(true);
  }
}
