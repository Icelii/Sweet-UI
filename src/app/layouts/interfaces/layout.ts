import { TranslationParams } from "@core/i18n/i18n";
import { TranslationKey } from "@core/i18n/translations";

export interface LayoutUser {
  name: string;
  img?: string;
  role: TranslationKey;
}

export interface LayoutNotification {
  id: number;
  author: string;
  message: TranslationKey;
  time: { key: TranslationKey; params?: TranslationParams };
  read: boolean;
}