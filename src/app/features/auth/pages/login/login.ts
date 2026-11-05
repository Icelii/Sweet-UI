import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { GoogleButton } from '@shared/components/google-button/google-button';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { emailOrPhoneValidator } from '@shared/validators/email-or-phone.validator';

const REMEMBERED_EMAIL_KEY = 'remembered_email';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ErrorMessages, GoogleButton, TablerIcon, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly loading = signal(false);
  protected readonly passwordVisible = signal(false);

  protected readonly loginForm = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, emailOrPhoneValidator()]],
    password: ['', [Validators.required]],
    remember_me: [false],
  });

  protected get f() {
    return this.loginForm.controls;
  }

  constructor() {
    // Fill in the email saved with "Remember me".
    const savedEmail = this.isBrowser ? localStorage.getItem(REMEMBERED_EMAIL_KEY) : null;
    if (savedEmail) this.loginForm.patchValue({ email: savedEmail, remember_me: true });
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected onGoogleSignIn(): void {
    // Start your Google Sign-In flow here.
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, remember_me } = this.loginForm.getRawValue();
    this.rememberEmail(email, remember_me);

    // Demo only: call your auth API here and navigate when it succeeds.
    void this.router.navigate(['/dashboard']);
  }

  private rememberEmail(email: string, remember: boolean): void {
    if (!this.isBrowser) return;
    if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }
}
