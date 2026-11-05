import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { I18n } from '@core/i18n/i18n';
import { TranslatedTitleStrategy } from '@core/i18n/translated-title-strategy';
import { Theme } from '@core/services/theme';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    // Apply the saved theme, and wait for the language texts before the first render.
    provideAppInitializer(() => {
      inject(Theme);
      return inject(I18n).ready;
    }),
  ],
};