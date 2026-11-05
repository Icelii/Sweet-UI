import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { Dropzone, DropzoneValue } from '@shared/components/dropzone/dropzone';
import { RangeSlider, RangeValue } from '@shared/components/range-slider/range-slider';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { Select, SelectOption } from '@shared/components/select/select';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

interface ChoiceCard {
  value: string;
  label: TranslationKey;
  description: TranslationKey;
  icon: TablerIconName;
}

const COUNTRY_CODES = ['MX', 'US', 'CA', 'ES', 'AR', 'CO', 'CL', 'PE', 'BR', 'FR', 'DE', 'IT', 'GB', 'JP'];

@Component({
  selector: 'app-forms-demo',
  imports: [ReactiveFormsModule, Select, Dropzone, RangeSlider, ErrorMessages, TablerIcon, TranslatePipe],
  templateUrl: './forms-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormsDemo {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18n);

  protected readonly passwordVisible = signal(false);
  protected readonly fileNames = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    // Basic inputs
    fullName: [''],
    email: [''],
    password: [''],
    age: [null as number | null],
    bio: [''],
    // States
    readonlyField: ['ID-2026-0042'],
    disabledField: [{ value: 'No editable', disabled: true }],
    errorField: ['correo-invalido', [Validators.required, Validators.email]],
    validField: ['iceli@example.com'],
    // Sizes
    sizeSm: [''],
    sizeMd: [''],
    sizeLg: [''],
    // With icons
    search: [''],
    mail: [''],
    location: [''],
    phoneIcon: [''],
    // Groups
    website: [''],
    domain: [''],
    price: [null as number | null],
    query: [''],
    phoneCode: ['+52'],
    phone: [''],
    // Selects
    nativeSelect: ['medium'],
    role: ['editor' as string | null],
    country: [null as string | null],
    frameworks: [['angular'] as string[]],
    skills: [[] as string[]],
    lockedSelect: [{ value: 'admin', disabled: true }],
    // Files
    photos: [[] as DropzoneValue],
    contract: [null as DropzoneValue],
    // Checkboxes
    channels: this.fb.nonNullable.group({ email: [true], sms: [false], push: [true] }),
    terms: [false, Validators.requiredTrue],
    // Toggles
    notifications: [true],
    marketing: [false],
    twoFactor: [true],
    // Radios
    plan: ['pro'],
    size: ['md'],
    payment: ['card'],
    // Range
    volume: [60],
    priceRange: [[1500, 7000] as RangeValue],
  });

  constructor() {
    // Shows the error state right away.
    this.form.controls.errorField.markAsTouched();
  }

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  /** Form value with files shown by name, so it is readable in the preview box. */
  protected readonly preview = computed(() =>
    JSON.stringify(
      this.formValue(),
      (_, value) => (value instanceof File ? `${value.name} (${Math.round(value.size / 1024)} KB)` : value),
      2,
    ),
  );

  // --- Select options ---
  protected readonly roleOptions = computed<SelectOption<string>[]>(() => {
    this.i18n.language();
    return [
      { value: 'admin', label: this.i18n.t('forms.role.admin'), description: this.i18n.t('forms.role.adminHint'), icon: 'settings' },
      { value: 'editor', label: this.i18n.t('forms.role.editor'), description: this.i18n.t('forms.role.editorHint'), icon: 'pages' },
      { value: 'viewer', label: this.i18n.t('forms.role.viewer'), description: this.i18n.t('forms.role.viewerHint'), icon: 'eye' },
      { value: 'guest', label: this.i18n.t('forms.role.guest'), description: this.i18n.t('forms.role.guestHint'), icon: 'user', disabled: true },
    ];
  });

  protected readonly countryOptions = computed<SelectOption<string>[]>(() => {
    const names = new Intl.DisplayNames([this.i18n.language()], { type: 'region' });
    return COUNTRY_CODES.map((code) => ({ value: code, label: names.of(code) ?? code, icon: 'world' as const }))
      .sort((a, b) => a.label.localeCompare(b.label, this.i18n.language()));
  });

  protected readonly frameworkOptions: SelectOption<string>[] = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'solid', label: 'Solid' },
    { value: 'qwik', label: 'Qwik' },
  ];

  protected readonly skillOptions: SelectOption<string>[] = [
    'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'PHP', 'Kotlin', 'Swift', 'Ruby', 'Dart',
  ].map((skill) => ({ value: skill.toLowerCase(), label: skill }));

  // --- Checkboxes: "select all" with indeterminate state ---
  protected readonly channelKeys = ['email', 'sms', 'push'] as const;
  protected readonly channelLabels: Record<(typeof this.channelKeys)[number], TranslationKey> = {
    email: 'forms.checkboxes.email',
    sms: 'forms.checkboxes.sms',
    push: 'forms.checkboxes.push',
  };
  private readonly channels = computed(() => this.formValue().channels ?? {});
  protected readonly allChannels = computed(() => this.channelKeys.every((key) => this.channels()[key]));
  protected readonly someChannels = computed(
    () => this.channelKeys.some((key) => this.channels()[key]) && !this.allChannels(),
  );

  protected toggleAllChannels(checked: boolean): void {
    this.form.controls.channels.setValue({ email: checked, sms: checked, push: checked });
  }

  // --- Radio cards ---
  protected readonly planCards: ChoiceCard[] = [
    { value: 'free', label: 'forms.plan.free', description: 'forms.plan.freeHint', icon: 'user' },
    { value: 'pro', label: 'forms.plan.pro', description: 'forms.plan.proHint', icon: 'users' },
    { value: 'team', label: 'forms.plan.team', description: 'forms.plan.teamHint', icon: 'stores' },
  ];

  protected readonly paymentCards: ChoiceCard[] = [
    { value: 'card', label: 'forms.payment.card', description: 'forms.payment.cardHint', icon: 'credit-card' },
    { value: 'transfer', label: 'forms.payment.transfer', description: 'forms.payment.transferHint', icon: 'stores' },
    { value: 'cash', label: 'forms.payment.cash', description: 'forms.payment.cashHint', icon: 'currency-dollar' },
  ];

  protected readonly sizes = ['sm', 'md', 'lg', 'xl'];

  protected onNativeFiles(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.fileNames.set(files.map((file) => file.name));
  }

  protected submit(): void {
    this.form.markAllAsTouched();
  }

  protected reset(): void {
    this.form.reset();
    this.fileNames.set([]);
  }
}