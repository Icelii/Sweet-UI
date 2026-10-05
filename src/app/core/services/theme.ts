import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';
const MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];

@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly media = this.isBrowser && typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
  private readonly systemPrefersDark = signal(this.media?.matches ?? false);

  readonly mode = signal<ThemeMode>(this.readStoredMode());

  readonly current = computed<ResolvedTheme>(() => {
    const mode = this.mode();
    if (mode !== 'system') return mode;
    return this.systemPrefersDark() ? 'dark' : 'light';
  });

  readonly isDark = computed(() => this.current() === 'dark');

  constructor() {
    if (!this.isBrowser) return;

    if (this.media) {
      const onChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
      this.media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onChange));
    }

    effect(() => {
      const theme = this.current();
      const root = this.document.documentElement;
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
    });

    effect(() => this.writeStoredMode(this.mode()));
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  toggle(): void {
    this.mode.set(this.isDark() ? 'light' : 'dark');
  }

  private readStoredMode(): ThemeMode {
    if (!this.isBrowser) return 'system';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      return stored && MODES.includes(stored) ? stored : 'system';
    } catch {
      return 'system';
    }
  }

  private writeStoredMode(mode: ThemeMode): void {
    try {
      if (mode === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  }
}