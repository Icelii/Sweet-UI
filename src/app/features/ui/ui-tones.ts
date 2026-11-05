import { TranslationKey } from '@core/i18n/translations';

export interface Tone {
  /** Color class suffix: ui-btn-{key} / ui-badge-{key}. */
  key: string;
  label: TranslationKey;
}

/** Every color of the button/badge system, in the order the docs show them. */
export const TONES: Tone[] = [
  { key: 'primary', label: 'ui.tone.primary' },
  { key: 'secondary', label: 'ui.tone.secondary' },
  { key: 'success', label: 'ui.tone.success' },
  { key: 'warning', label: 'ui.tone.warning' },
  { key: 'danger', label: 'ui.tone.danger' },
  { key: 'info', label: 'ui.tone.info' },
  { key: 'neutral', label: 'ui.tone.neutral' },
];