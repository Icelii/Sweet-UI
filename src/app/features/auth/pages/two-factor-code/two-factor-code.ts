import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { interval, Subscription, take } from 'rxjs';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

@Component({
  selector: 'app-two-factor-code',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './two-factor-code.html',
  styleUrl: './two-factor-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoFactorCode {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('inputField');
  private timerSub?: Subscription;

  /** One digit per box; '' while empty. */
  protected readonly code = signal<string[]>(Array(CODE_LENGTH).fill(''));
  protected readonly isCodeComplete = computed(() => this.code().every((digit) => digit !== ''));
  protected readonly timeLeft = signal(RESEND_SECONDS);
  protected readonly canResend = signal(false);
  protected readonly loading = signal(false);

  constructor() {
    this.startCountdown();
    afterNextRender(() => this.focusInput(0));
  }

  protected onSubmit(): void {
    if (!this.isCodeComplete() || this.loading()) return;

    // Demo only: send this.code().join('') to your API to verify it, then navigate.
    void this.router.navigate(['/dashboard']);
  }

  protected resend(): void {
    this.clearCode();
    this.startCountdown();
  }

  protected onInputChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;

    // Autofill or typing over a full box can bring several digits at once.
    if (input.value.length > 1) {
      this.fillFrom(input.value);
      return;
    }

    const digit = input.value.replace(/\D/g, '');
    input.value = digit;
    this.setDigit(index, digit);

    if (digit && index < CODE_LENGTH - 1) this.focusInput(index + 1);
  }

  protected onBackspace(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.value && index > 0) this.focusInput(index - 1);
    else this.setDigit(index, '');
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    this.fillFrom(event.clipboardData?.getData('text') ?? '');
  }

  private startCountdown(): void {
    this.timeLeft.set(RESEND_SECONDS);
    this.canResend.set(false);
    this.timerSub?.unsubscribe();

    this.timerSub = interval(1000)
      .pipe(take(RESEND_SECONDS), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.timeLeft.update((seconds) => seconds - 1),
        complete: () => this.canResend.set(true),
      });
  }

  private setDigit(index: number, digit: string): void {
    this.code.update((code) => code.map((value, i) => (i === index ? digit : value)));
  }

  private fillFrom(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
    if (!digits.length) return;

    this.writeCode(Array.from({ length: CODE_LENGTH }, (_, i) => digits[i] ?? ''));
    this.focusInput(Math.min(digits.length, CODE_LENGTH - 1));
  }

  private clearCode(): void {
    this.writeCode(Array(CODE_LENGTH).fill(''));
    this.focusInput(0);
  }

  /** Updates the boxes right away, so the focus moves to an already filled box. */
  private writeCode(code: string[]): void {
    this.code.set(code);
    this.inputs().forEach((input, i) => (input.nativeElement.value = code[i]));
  }

  private focusInput(index: number): void {
    this.inputs()[index]?.nativeElement.focus();
  }
}
