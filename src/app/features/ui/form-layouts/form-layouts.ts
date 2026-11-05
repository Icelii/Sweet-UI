import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { Datepicker, DatepickerValue } from '@shared/components/datepicker/datepicker';
import { Dropzone, DropzoneValue } from '@shared/components/dropzone/dropzone';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { Select, SelectOption } from '@shared/components/select/select';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { matchFieldsValidator } from '@shared/validators/match-fields.validator';

interface WizardStep {
  title: TranslationKey;
  hint: TranslationKey;
}

interface PlanCard {
  value: string;
  label: TranslationKey;
  price: string;
  icon: TablerIconName;
}

const COUNTRY_CODES = ['MX', 'US', 'CA', 'ES', 'AR', 'CO', 'CL', 'PE'];

@Component({
  selector: 'app-form-layouts',
  imports: [ReactiveFormsModule, Select, Datepicker, Dropzone, ErrorMessages, TablerIcon, TranslatePipe],
  templateUrl: './form-layouts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLayouts {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18n);

  // --- Shared options ---
  protected readonly topicOptions = computed<SelectOption<string>[]>(() => {
    this.i18n.language();
    return [
      { value: 'support', label: this.i18n.t('layouts.topic.support'), icon: 'reviews' },
      { value: 'sales', label: this.i18n.t('layouts.topic.sales'), icon: 'orders' },
      { value: 'billing', label: this.i18n.t('layouts.topic.billing'), icon: 'credit-card' },
    ];
  });

  protected readonly roleOptions = computed<SelectOption<string>[]>(() => {
    this.i18n.language();
    return [
      { value: 'admin', label: this.i18n.t('forms.role.admin'), icon: 'settings' },
      { value: 'editor', label: this.i18n.t('forms.role.editor'), icon: 'pages' },
      { value: 'viewer', label: this.i18n.t('forms.role.viewer'), icon: 'eye' },
    ];
  });

  protected readonly statusOptions = computed<SelectOption<string>[]>(() => {
    this.i18n.language();
    return [
      { value: 'active', label: this.i18n.t('layouts.status.active') },
      { value: 'pending', label: this.i18n.t('layouts.status.pending') },
      { value: 'cancelled', label: this.i18n.t('layouts.status.cancelled') },
    ];
  });

  protected readonly stateOptions: SelectOption<string>[] = [
    'Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Querétaro', 'Yucatán',
  ].map((state) => ({ value: state, label: state }));

  protected readonly countryOptions = computed<SelectOption<string>[]>(() => {
    const names = new Intl.DisplayNames([this.i18n.language()], { type: 'region' });
    return COUNTRY_CODES.map((code) => ({ value: code, label: names.of(code) ?? code, icon: 'world' as const }));
  });

  // --- 1. Vertical ---
  protected readonly contactSent = signal(false);
  protected readonly contactForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    topic: [null as string | null, Validators.required],
    message: ['', [Validators.required, Validators.maxLength(500)]],
    copy: [true],
  });

  protected sendContact(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.contactSent.set(true);
    this.contactForm.reset();
    setTimeout(() => this.contactSent.set(false), 3000);
  }

  // --- 2. Horizontal ---
  protected readonly accountForm = this.fb.nonNullable.group({
    username: ['iceli', Validators.required],
    email: ['iceli@example.com', [Validators.required, Validators.email]],
    password: [''],
    role: ['editor' as string | null],
    active: [true],
  });

  // --- 3. Columns ---
  protected readonly addressForm = this.fb.nonNullable.group({
    firstName: [''],
    lastName: [''],
    email: [''],
    phone: [''],
    birthdate: [null as DatepickerValue],
    street: [''],
    neighborhood: [''],
    city: [''],
    state: [null as string | null],
    zip: [''],
    country: ['MX' as string | null],
  });

  // --- 4. Inline ---
  protected readonly filtersForm = this.fb.nonNullable.group({
    search: [''],
    status: [null as string | null],
    dates: [null as DatepickerValue],
  });
  protected readonly newsletterForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly subscribed = signal(false);

  protected subscribe(): void {
    if (this.newsletterForm.invalid) {
      this.newsletterForm.markAllAsTouched();
      return;
    }
    this.subscribed.set(true);
  }

  // --- 5. Sections ---
  protected readonly saving = signal(false);
  protected readonly settingsForm = this.fb.nonNullable.group({
    avatar: [null as DropzoneValue],
    username: ['alex.rivera'],
    bio: [''],
    name: ['Iceli'],
    email: ['iceli@example.com', [Validators.required, Validators.email]],
    phone: [''],
    comments: [true],
    mentions: [true],
    orders: [false],
  });

  protected saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      // Saved values become the new starting point.
      this.settingsForm.reset(this.settingsForm.getRawValue());
    }, 900);
  }

  protected discardSettings(): void {
    this.settingsForm.reset();
  }

  // --- 6. Wizard ---
  protected readonly steps: WizardStep[] = [
    { title: 'layouts.wizard.account', hint: 'layouts.wizard.accountHint' },
    { title: 'layouts.wizard.profile', hint: 'layouts.wizard.profileHint' },
    { title: 'layouts.wizard.plan', hint: 'layouts.wizard.planHint' },
    { title: 'layouts.wizard.confirm', hint: 'layouts.wizard.confirmHint' },
  ];

  protected readonly plans: PlanCard[] = [
    { value: 'free', label: 'forms.plan.free', price: '$0', icon: 'user' },
    { value: 'pro', label: 'forms.plan.pro', price: '$299', icon: 'users' },
    { value: 'team', label: 'forms.plan.team', price: '$899', icon: 'stores' },
  ];

  protected readonly showAccountPassword = signal(false);
  protected readonly showWizardPassword = signal(false);
  protected readonly showWizardConfirm = signal(false);

  protected readonly step = signal(0);
  protected readonly finished = signal(false);

  protected readonly wizard = this.fb.nonNullable.group({
    account: this.fb.nonNullable.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirm: ['', Validators.required],
      },
      { validators: matchFieldsValidator('password', 'confirm') },
    ),
    profile: this.fb.nonNullable.group({
      name: ['', Validators.required],
      role: [null as string | null, Validators.required],
      birthdate: [null as DatepickerValue, Validators.required],
    }),
    plan: this.fb.nonNullable.group({
      plan: ['pro', Validators.required],
    }),
  });

  private readonly stepGroups = [this.wizard.controls.account, this.wizard.controls.profile, this.wizard.controls.plan];

  protected readonly summary = computed(() => {
    this.step();
    this.i18n.language();
    const value = this.wizard.getRawValue();
    const birthdate = value.profile.birthdate instanceof Date
      ? new Intl.DateTimeFormat(this.i18n.language(), { dateStyle: 'long' }).format(value.profile.birthdate)
      : '—';
    const plan = this.plans.find((item) => item.value === value.plan.plan);
    return [
      { label: 'forms.field.email' as TranslationKey, value: value.account.email },
      { label: 'forms.field.name' as TranslationKey, value: value.profile.name },
      { label: 'layouts.field.role' as TranslationKey, value: this.roleOptions().find((role) => role.value === value.profile.role)?.label ?? '—' },
      { label: 'profile.field.birthdate' as TranslationKey, value: birthdate },
      { label: 'layouts.wizard.plan' as TranslationKey, value: plan ? `${this.i18n.t(plan.label)} · ${plan.price}` : '—' },
    ];
  });

  protected next(): void {
    const group = this.stepGroups[this.step()];
    if (group?.invalid) {
      group.markAllAsTouched();
      return;
    }
    this.step.update((step) => Math.min(step + 1, this.steps.length - 1));
  }

  protected back(): void {
    this.step.update((step) => Math.max(step - 1, 0));
  }

  /** Only steps already reached can be revisited from the stepper. */
  protected goTo(index: number): void {
    if (index < this.step()) this.step.set(index);
  }

  protected finish(): void {
    this.finished.set(true);
  }

  protected restart(): void {
    this.wizard.reset();
    this.step.set(0);
    this.finished.set(false);
  }
}