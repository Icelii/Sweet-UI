import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Language, TRANSLATIONS, TranslationKey } from './translations';

export type { Language, TranslationKey } from './translations';

export const LANGUAGE_STORAGE_KEY = 'lang';

const LANGUAGES: readonly Language[] = ['es', 'en'];
const DEFAULT_LANGUAGE: Language = 'es';

export type TranslationParams = Record<string, string | number>;

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly languages = LANGUAGES;
  readonly language = signal<Language>(this.readInitialLanguage());

  constructor() {
    if (!this.isBrowser) return;

    effect(() => {
      const language = this.language();
      this.document.documentElement.lang = language;
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch {}
    });
  }

  setLanguage(language: Language): void {
    this.language.set(language);
  }

  toggle(): void {
    this.language.update((current) => (current === 'es' ? 'en' : 'es'));
  }

  t(key: TranslationKey, params?: TranslationParams): string {
    const text = TRANSLATIONS[this.language()][key] ?? key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  }

  private readInitialLanguage(): Language {
    if (!this.isBrowser) return DEFAULT_LANGUAGE;
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (stored && LANGUAGES.includes(stored)) return stored;
    } catch {}
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : DEFAULT_LANGUAGE;
  }
}