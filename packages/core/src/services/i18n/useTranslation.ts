/**
 * Translation Hooks for zOS
 *
 * Convenience hooks for common i18n operations.
 * Lighter-weight alternatives to useI18n when only translation is needed.
 */

import { useCallback, useMemo } from 'react';
import type { Locale, TranslationParams } from './types';
import { useI18n } from './I18nContext';

/**
 * Return type for useTranslation hook
 */
export interface UseTranslationResult {
  /** Translation function */
  t: (key: string, params?: TranslationParams) => string;
  /** Current locale */
  locale: Locale;
}

/**
 * Hook for translations only
 *
 * Lighter-weight alternative to useI18n when only t() and locale are needed.
 *
 * @example
 * ```tsx
 * function Button() {
 *   const { t } = useTranslation();
 *   return <button>{t('common.save')}</button>;
 * }
 * ```
 */
export function useTranslation(): UseTranslationResult {
  const { t, locale } = useI18n();
  return useMemo(() => ({ t, locale }), [t, locale]);
}

/**
 * Return type for useFormattedDate hook
 */
export interface UseFormattedDateResult {
  /** Format a date */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  /** Format relative time */
  formatRelativeTime: (date: Date) => string;
  /** Current locale */
  locale: Locale;
}

/**
 * Hook for date formatting only
 *
 * @example
 * ```tsx
 * function DateDisplay({ date }: { date: Date }) {
 *   const { formatDate, formatRelativeTime } = useFormattedDate();
 *   return (
 *     <div>
 *       <span>{formatDate(date)}</span>
 *       <span>{formatRelativeTime(date)}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFormattedDate(): UseFormattedDateResult {
  const { formatDate, formatRelativeTime, locale } = useI18n();
  return useMemo(
    () => ({ formatDate, formatRelativeTime, locale }),
    [formatDate, formatRelativeTime, locale]
  );
}

/**
 * Return type for useFormattedNumber hook
 */
export interface UseFormattedNumberResult {
  /** Format a number */
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  /** Format a currency amount */
  formatCurrency: (amount: number, currency?: string) => string;
  /** Current locale */
  locale: Locale;
}

/**
 * Hook for number and currency formatting only
 *
 * @example
 * ```tsx
 * function PriceDisplay({ price }: { price: number }) {
 *   const { formatCurrency } = useFormattedNumber();
 *   return <span>{formatCurrency(price, 'USD')}</span>;
 * }
 * ```
 */
export function useFormattedNumber(): UseFormattedNumberResult {
  const { formatNumber, formatCurrency, locale } = useI18n();
  return useMemo(
    () => ({ formatNumber, formatCurrency, locale }),
    [formatNumber, formatCurrency, locale]
  );
}

/**
 * Return type for useLocale hook
 */
export interface UseLocaleResult {
  /** Current locale */
  locale: Locale;
  /** Set the locale */
  setLocale: (locale: Locale) => void;
  /** Available locales */
  availableLocales: Locale[];
}

/**
 * Hook for locale management only
 *
 * @example
 * ```tsx
 * function LocaleSelector() {
 *   const { locale, setLocale, availableLocales } = useLocale();
 *   return (
 *     <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *       {availableLocales.map((loc) => (
 *         <option key={loc} value={loc}>{loc}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useLocale(): UseLocaleResult {
  const { locale, setLocale, availableLocales } = useI18n();
  return useMemo(
    () => ({ locale, setLocale, availableLocales }),
    [locale, setLocale, availableLocales]
  );
}

/**
 * Hook for a namespaced translation function
 *
 * Creates a translation function scoped to a namespace prefix.
 * Useful for component-specific translations.
 *
 * @param namespace - Prefix to prepend to all keys
 *
 * @example
 * ```tsx
 * function Dialog() {
 *   const t = useNamespacedTranslation('dialogs');
 *   return (
 *     <div>
 *       <p>{t('confirmDelete')}</p>
 *       <button>{t('ok')}</button>
 *     </div>
 *   );
 * }
 * // Looks up 'dialogs.confirmDelete' and 'dialogs.ok'
 * ```
 */
export function useNamespacedTranslation(
  namespace: string
): (key: string, params?: TranslationParams) => string {
  const { t } = useI18n();

  return useCallback(
    (key: string, params?: TranslationParams): string => {
      return t(`${namespace}.${key}`, params);
    },
    [t, namespace]
  );
}

/**
 * Hook that returns a translation function that falls back to a default value
 *
 * Useful when you want to provide inline defaults for missing translations.
 *
 * @example
 * ```tsx
 * function Banner() {
 *   const t = useTranslationWithDefault();
 *   return (
 *     <div>{t('promo.banner', 'Check out our new features!')}</div>
 *   );
 * }
 * ```
 */
export function useTranslationWithDefault(): (
  key: string,
  defaultValue: string,
  params?: TranslationParams
) => string {
  const { t } = useI18n();

  return useCallback(
    (key: string, defaultValue: string, params?: TranslationParams): string => {
      const result = t(key, params);
      // If the result equals the key, translation was not found
      return result === key ? defaultValue : result;
    },
    [t]
  );
}
