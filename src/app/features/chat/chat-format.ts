import { I18n } from '@core/i18n/i18n';

const locale = (i18n: I18n) => (i18n.language() === 'en' ? 'en-US' : 'es-MX');

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole days between the date and today (0 = today). */
export function daysAgo(date: Date): number {
  return Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
}

export function formatTime(i18n: I18n, date: Date): string {
  return new Intl.DateTimeFormat(locale(i18n), { hour: 'numeric', minute: '2-digit' }).format(date);
}

/** For the conversation list: the time today, "Yesterday", the weekday this week, or the date. */
export function formatListDate(i18n: I18n, date: Date): string {
  const days = daysAgo(date);
  if (days === 0) return formatTime(i18n, date);
  if (days === 1) return i18n.t('chat.yesterday');
  if (days < 7) return capitalize(new Intl.DateTimeFormat(locale(i18n), { weekday: 'short' }).format(date).replace('.', ''));
  return new Intl.DateTimeFormat(locale(i18n), { day: 'numeric', month: 'short' }).format(date);
}

/** For the separators between days inside a conversation. */
export function formatDay(i18n: I18n, date: Date): string {
  const days = daysAgo(date);
  if (days === 0) return i18n.t('chat.today');
  if (days === 1) return i18n.t('chat.yesterday');
  return capitalize(new Intl.DateTimeFormat(locale(i18n), { weekday: 'long', day: 'numeric', month: 'long' }).format(date));
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}