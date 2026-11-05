import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, ErrorMessages, TablerIcon, TranslatePipe],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  protected readonly loading = signal(false);
  /** Email the link was sent to; shows the confirmation instead of the form. */
  protected readonly sentTo = signal<string | null>(null);

  protected readonly forgotForm = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected get f() {
    return this.forgotForm.controls;
  }

  /** Back to the form to use another email. */
  protected useOtherEmail(): void {
    this.sentTo.set(null);
  }

  protected onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    // Demo only: ask your API to send the reset email, then show the confirmation.
    this.sentTo.set(this.forgotForm.getRawValue().email);
  }
}
