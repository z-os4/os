/**
 * Internationalization (i18n) Types for zOS
 *
 * Defines core types for translation, localization, and formatting.
 * Uses browser Intl APIs for date, number, and currency formatting.
 */

/**
 * Locale identifier string
 *
 * BCP 47 language tags: 'en', 'en-US', 'es', 'fr', 'zh-CN', etc.
 */
export type Locale = string;

/**
 * Nested translation dictionary
 *
 * Supports dot-notation key access: 'common.ok' -> translations.common.ok
 */
export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

/**
 * Configuration for a single locale
 */
export interface LocaleConfig {
  /** Locale identifier */
  locale: Locale;
  /** Fallback locale when translation is missing */
  fallbackLocale?: Locale;
  /** Translation dictionary for this locale */
  translations: TranslationDict;
  /** Default date format options */
  dateFormat?: Intl.DateTimeFormatOptions;
  /** Default number format options */
  numberFormat?: Intl.NumberFormatOptions;
}

/**
 * Parameters for interpolated translations
 *
 * Keys map to placeholders in translation strings: 'Hello, {name}!'
 */
export type TranslationParams = Record<string, string | number>;

/**
 * React context value for i18n
 */
export interface I18nContextValue {
  /** Current active locale */
  locale: Locale;

  /**
   * Change the current locale
   * @param locale - New locale to set
   */
  setLocale: (locale: Locale) => void;

  /**
   * Translate a key with optional parameter interpolation
   * @param key - Dot-notation key: 'common.ok', 'menu.file'
   * @param params - Optional parameters for interpolation
   * @returns Translated string or key if not found
   */
  t: (key: string, params?: TranslationParams) => string;

  /**
   * Format a date according to locale
   * @param date - Date to format
   * @param options - Intl.DateTimeFormat options
   */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;

  /**
   * Format a number according to locale
   * @param num - Number to format
   * @param options - Intl.NumberFormat options
   */
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;

  /**
   * Format a currency amount
   * @param amount - Numeric amount
   * @param currency - ISO 4217 currency code (default: 'USD')
   */
  formatCurrency: (amount: number, currency?: string) => string;

  /**
   * Format relative time (e.g., '2 hours ago', 'in 3 days')
   * @param date - Target date to compare against now
   */
  formatRelativeTime: (date: Date) => string;

  /** List of available locales */
  availableLocales: Locale[];
}

/**
 * Listener callback for locale changes
 */
export type LocaleChangeListener = () => void;

/**
 * Internal i18n state
 */
export interface I18nState {
  locale: Locale;
  translations: Map<Locale, TranslationDict>;
  fallbackLocale: Locale;
}

/**
 * Storage key for persisted locale preference
 */
export const LOCALE_STORAGE_KEY = 'zos-locale';

/**
 * Default locale when none is set
 */
export const DEFAULT_LOCALE: Locale = 'en';
