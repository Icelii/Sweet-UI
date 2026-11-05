import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { NAVIGATION } from '@core/navigation/navigation';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

interface SearchEntry {
  path: string;
  label: TranslationKey;
  icon: TablerIconName;
  /** Breadcrumb shown under the label, e.g. "Datos › Formularios". */
  trail: TranslationKey[];
}

/** Every page reachable from the sidebar, plus account settings. */
function buildEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const section of NAVIGATION) {
    const sectionTrail = section.title ? [section.title] : [];
    for (const item of section.items) {
      if (item.children?.length) {
        for (const child of item.children) {
          entries.push({ path: child.path, label: child.label, icon: item.icon, trail: [...sectionTrail, item.label] });
        }
      } else if (item.path) {
        entries.push({ path: item.path, label: item.label, icon: item.icon, trail: sectionTrail });
      }
    }
  }
  entries.push({ path: '/account-settings/profile', label: 'layout.profileSettings', icon: 'user-circle', trail: ['accountSettings.title'] });
  return entries;
}

let nextId = 0;

/** Lowercase without accents, so "formulario" finds "Formularios" and "pagina" finds "Página". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Page search for the top bar.
 * - desktop: a search field with a results dropdown (Ctrl/⌘ + K focuses it).
 * - mobile: a search button that opens a full-screen search.
 */
@Component({
  selector: 'app-global-search',
  imports: [NgTemplateOutlet, TablerIcon, TranslatePipe],
  templateUrl: './global-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onShortcut($event)',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class GlobalSearch {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly variant = input<'mobile' | 'desktop'>('desktop');
  protected readonly isDesktop = computed(() => this.variant() === 'desktop');

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);
  protected readonly listId = `global-search-${nextId++}`;
  protected readonly isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly mobileDialog = viewChild<ElementRef<HTMLDialogElement>>('mobileDialog');
  private readonly entries = buildEntries();

  protected readonly results = computed(() => {
    this.i18n.language();
    const query = normalize(this.query().trim());
    if (!query) return this.entries;
    return this.entries.filter((entry) =>
      normalize([entry.label, ...entry.trail].map((key) => this.i18n.t(key)).join(' ')).includes(query),
    );
  });

  protected readonly activeId = computed(() =>
    this.results().length ? `${this.listId}-${this.activeIndex()}` : null,
  );

  // --- Open / close ---
  protected openSearch(): void {
    if (this.open()) return;
    this.activeIndex.set(0);
    this.open.set(true);

    // Desktop: the field already exists, so focus it now and no keystroke is lost.
    if (this.isDesktop()) {
      this.searchInput()?.nativeElement.focus();
      return;
    }
    // Mobile: a modal <dialog> sits in the top layer, above the blurred top bar and the page.
    afterNextRender(
      () => {
        this.mobileDialog()?.nativeElement.showModal();
        this.searchInput()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  protected close(): void {
    this.open.set(false);
    this.query.set('');
    this.mobileDialog()?.nativeElement.close();
    this.searchInput()?.nativeElement.blur();
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
    if (!this.open()) this.open.set(true);
  }

  protected go(entry: SearchEntry): void {
    this.close();
    this.router.navigateByUrl(entry.path);
  }

  // --- Keyboard ---
  protected onKeydown(event: KeyboardEvent): void {
    const total = this.results().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) this.openSearch();
        else if (total) this.activeIndex.update((index) => (index + 1) % total);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (total) this.activeIndex.update((index) => (index - 1 + total) % total);
        break;
      case 'Enter': {
        event.preventDefault();
        const entry = this.results()[this.activeIndex()];
        if (entry) this.go(entry);
        return;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        return;
      default:
        return;
    }
    afterNextRender(() => {
        const id = this.activeId();
        if (id) this.document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
      },
      { injector: this.injector },
    );
  }

  /** Ctrl/⌘ + K opens the search that is visible at the current screen size. */
  protected onShortcut(event: KeyboardEvent): void {
    if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey)) return;
    const desktopScreen = window.matchMedia('(min-width: 1024px)').matches;
    if (desktopScreen !== this.isDesktop()) return;
    event.preventDefault();
    this.openSearch();
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (this.open() && this.isDesktop() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }
}