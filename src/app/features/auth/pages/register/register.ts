import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BRAND } from '@core/config/brand';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { GoogleButton } from '@shared/components/google-button/google-button';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { matchFieldsValidator } from '@shared/validators/match-fields.validator';

/** At least 8 characters with a lowercase, an uppercase, a number and a symbol. */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, ErrorMessages, GoogleButton, TablerIcon, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly router = inject(Router);
  protected readonly brand = BRAND;
  protected readonly loading = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly confirmPasswordVisible = signal(false);

  protected readonly registerForm = inject(FormBuilder).nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      confirm_password: ['', [Validators.required]],
      accept_terms: [false, [Validators.requiredTrue]],
    },
    { validators: [matchFieldsValidator('password', 'confirm_password')] },
  );

  protected get f() {
    return this.registerForm.controls;
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible.update((visible) => !visible);
  }

  protected onGoogleSignUp(): void {
    // Start your Google Sign-In flow here.
  }

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Demo only: send name, email and password to your API here and navigate when it succeeds.
    void this.router.navigate(['/dashboard']);
  }
}
