import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationKey } from '@core/i18n/translations';
import { Datepicker } from '@shared/components/datepicker/datepicker';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { Modal } from '@shared/components/modal/modal';
import { FallbackImage } from '@shared/directives/fallback-image';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

const PHONE_PATTERN = /^\d{10}$/;

interface ProfileUser {
  name: string;
  email: string;
  role: TranslationKey;
  phone: string;
  birthdate: Date | null;
  img?: string;
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, Datepicker, ErrorMessages, Modal, InitialsPipe, TranslatePipe, FallbackImage],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  private readonly fb = inject(FormBuilder);

  // Sample data: replace it with the authenticated user.
  readonly user = signal<ProfileUser>({
    name: 'Iceli',
    email: 'iceli@example.com',
    role: 'user.role.admin',
    phone: '',
    birthdate: null,
    img: 'https://i.pinimg.com/1200x/c5/31/23/c531234b590d2192691fa65ec66404bb.jpg'
  });

  readonly today = new Date();

  readonly loading = signal(false);
  readonly deleting = signal(false);
  readonly isDeleteModalOpen = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    name: [this.user().name, [Validators.required, Validators.maxLength(80)]],
    email: [this.user().email, [Validators.required, Validators.email]],
    phone: [this.user().phone, [Validators.pattern(PHONE_PATTERN)]],
    birthdate: [this.user().birthdate],
  });

  readonly deleteForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
    email: ['', [Validators.required, Validators.email]],
  });

  private readonly confirmEmail = toSignal(this.deleteForm.controls.email.valueChanges, { initialValue: '' });
  readonly emailMatches = computed(() => this.confirmEmail().trim().toLowerCase() === this.user().email.toLowerCase());

  // VALIDATORS
  get f() {
    return this.profileForm.controls;
  }

  get df() {
    return this.deleteForm.controls;
  }

  // UPDATE PROFILE
  onSubmit() {
    if (this.loading()) return;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    const payload = { ...value, name: value.name.trim(), email: value.email.trim(), phone: value.phone.trim() };

    // Demo only: send `payload` to your API here. The card above updates right away.
    this.user.update((user) => ({ ...user, ...payload }));
    this.profileForm.reset(payload);
  }

  // DELETE ACCOUNT MODAL
  openDeleteModal() {
    this.deleteForm.reset();
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    if (!this.deleting()) this.isDeleteModalOpen.set(false);
  }

  // DELETE ACCOUNT
  deleteAccount() {
    if (this.deleting()) return;

    if (this.deleteForm.invalid || !this.emailMatches()) {
      this.deleteForm.markAllAsTouched();
      return;
    }

    this.deleting.set(true);

  }
}