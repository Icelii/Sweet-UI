import type { es } from './locales/es';

/**
 * Texts live in ./locales/<language>/, one file per area (app, auth, components, dashboard,
 * chat, demos). Spanish defines the keys; every other language must have the same ones.
 */
export type TranslationKey = keyof typeof es;
export type Dictionary = Record<TranslationKey, string>;
export type Language = 'es' | 'en';

/** Each language is a separate download, fetched only when it is used. */
export const DICTIONARIES: Record<Language, () => Promise<Dictionary>> = {
  es: () => import('./locales/es').then((m) => m.es),
  en: () => import('./locales/en').then((m) => m.en),
};
