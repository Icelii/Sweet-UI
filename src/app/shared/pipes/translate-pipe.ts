import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18n, TranslationKey, TranslationParams } from '@core/i18n/i18n';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.i18n.t(key, params);
  }
}