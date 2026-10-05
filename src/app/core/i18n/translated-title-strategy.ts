import { effect, inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18n, TranslationKey } from './i18n';

const DEFAULT_TITLE = 'SweetUi';

@Injectable()
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);
  private readonly key = signal<string | undefined>(undefined);

  constructor() {
    super();
    effect(() => {
      this.title.setTitle(this.resolve(this.key()));
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.key.set(key);
    this.title.setTitle(this.resolve(key));
  }

  private resolve(key: string | undefined): string {
    return key ? this.i18n.t(key as TranslationKey) : DEFAULT_TITLE;
  }
}