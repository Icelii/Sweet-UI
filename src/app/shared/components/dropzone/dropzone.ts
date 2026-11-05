import { booleanAttribute, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, forwardRef, inject, input, model, numberAttribute, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

export type DropzoneValue = File[] | File | null;

interface FileItem {
  file: File;
  preview: string | null;
  size: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Same rules as the `accept` attribute: ".pdf", "image/*" or "image/png". */
function matchesAccept(file: File, accept: string): boolean {
  if (!accept.trim()) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule);
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

@Component({
  selector: 'app-dropzone',
  imports: [TablerIcon, TranslatePipe],
  templateUrl: './dropzone.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Dropzone), multi: true }],
  host: { class: 'block' },
})
export class Dropzone implements ControlValueAccessor {
  private readonly i18n = inject(I18n);

  readonly multiple = input(true, { transform: booleanAttribute });
  /** Same format as the `accept` attribute, e.g. "image/*" or ".pdf,.docx". */
  readonly accept = input('');
  /** Per-file limit in MB (0 = no limit). */
  readonly maxSizeMb = input(0, { transform: numberAttribute });
  /** Total files allowed (0 = no limit). */
  readonly maxFiles = input(0, { transform: numberAttribute });
  /** Smaller, horizontal version. */
  readonly compact = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly value = model<DropzoneValue>(null);

  protected readonly dragging = signal(false);
  protected readonly errors = signal<string[]>([]);
  private readonly formDisabled = signal(false);
  private readonly previews = new Map<File, string>();
  private dragDepth = 0;

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  private onChange: (value: DropzoneValue) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly files = computed<File[]>(() => {
    const value = this.value();
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });

  protected readonly items = computed<FileItem[]>(() =>
    this.files().map((file) => ({ file, preview: this.previewFor(file), size: formatSize(file.size) })),
  );

  protected readonly hints = computed(() => {
    this.i18n.language();
    const hints: string[] = [];
    if (this.accept()) hints.push(this.i18n.t('dropzone.hintTypes', { types: this.accept().replaceAll(',', ', ') }));
    if (this.maxSizeMb()) hints.push(this.i18n.t('dropzone.hintSize', { size: this.maxSizeMb() }));
    if (this.multiple() && this.maxFiles()) hints.push(this.i18n.t('dropzone.hintCount', { count: this.maxFiles() }));
    return hints.join(' · ');
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.previews.forEach((url) => URL.revokeObjectURL(url)));
  }

  // --- ControlValueAccessor ---
  writeValue(value: DropzoneValue): void {
    this.value.set(value ?? (this.multiple() ? [] : null));
    this.cleanPreviews();
  }

  registerOnChange(fn: (value: DropzoneValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // --- Events ---
  protected browse(): void {
    if (!this.isDisabled()) this.fileInput().nativeElement.click();
  }

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  protected onDragEnter(event: DragEvent): void {
    event.preventDefault();
    if (this.isDisabled()) return;
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = this.isDisabled() ? 'none' : 'copy';
  }

  protected onDragLeave(): void {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (!this.dragDepth) this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    if (this.isDisabled()) return;
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  protected remove(file: File): void {
    if (this.isDisabled()) return;
    this.commit(this.files().filter((item) => item !== file));
    this.errors.set([]);
  }

  // --- Helpers ---
  private addFiles(incoming: File[]): void {
    if (!incoming.length) return;
    const errors: string[] = [];
    const maxBytes = this.maxSizeMb() * 1024 * 1024;

    const valid = incoming.filter((file) => {
      if (!matchesAccept(file, this.accept())) {
        errors.push(this.i18n.t('dropzone.errorType', { name: file.name }));
        return false;
      }
      if (maxBytes && file.size > maxBytes) {
        errors.push(this.i18n.t('dropzone.errorSize', { name: file.name, size: this.maxSizeMb() }));
        return false;
      }
      return true;
    });

    let next = this.multiple() ? [...this.files(), ...valid] : valid.slice(-1);
    if (this.multiple() && this.maxFiles() && next.length > this.maxFiles()) {
      errors.push(this.i18n.t('dropzone.errorCount', { count: this.maxFiles() }));
      next = next.slice(0, this.maxFiles());
    }

    this.errors.set(errors);
    if (valid.length) this.commit(next);
    this.onTouched();
  }

  private commit(files: File[]): void {
    const value = this.multiple() ? files : (files[0] ?? null);
    this.value.set(value);
    this.cleanPreviews();
    this.onChange(value);
  }

  private previewFor(file: File): string | null {
    if (!file.type.startsWith('image/')) return null;
    let url = this.previews.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this.previews.set(file, url);
    }
    return url;
  }

  /** Frees the preview URLs of files that are no longer selected. */
  private cleanPreviews(): void {
    const current = new Set(this.files());
    for (const [file, url] of this.previews) {
      if (!current.has(file)) {
        URL.revokeObjectURL(url);
        this.previews.delete(file);
      }
    }
  }
}