/**
 * Internationalization Service for zOS
 *
 * Singleton service providing translation and localization capabilities.
 * Uses browser Intl APIs for date, number, and currency formatting.
 * Persists locale preference to localStorage.
 */

import type {
  Locale,
  TranslationDict,
  TranslationParams,
  LocaleChangeListener,
} from './types';
import { LOCALE_STORAGE_KEY, DEFAULT_LOCALE } from './types';
import { EN_TRANSLATIONS } from './defaultTranslations';

/**
 * Internationalization service implementation
 *
 * Provides:
 * - Translation lookup with fallback
 * - Parameter interpolation
 * - Date/number/currency formatting via Intl
 * - Relative time formatting
 * - Locale persistence
 */
class I18nServiceImpl {
  private locale: Locale = DEFAULT_LOCALE;
  private fallbackLocale: Locale = DEFAULT_LOCALE;
  private translations: Map<Locale, TranslationDict> = new Map();
  private listeners: Set<LocaleChangeListener> = new Set();

  constructor() {
    // Register default English translations
    this.translations.set('en', EN_TRANSLATIONS);

    // Load persisted locale
    this.loadPersistedLocale();
  }

  /**
   * Load locale preference from localStorage
   */
  private loadPersistedLocale(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && this.translations.has(stored)) {
        this.locale = stored;
      } else {
        // Try to use browser locale
        const browserLocale = navigator.language.split('-')[0];
        if (this.translations.has(browserLocale)) {
          this.locale = browserLocale;
        }
      }
    } catch {
      // localStorage unavailable, use default
    }
  }

  /**
   * Persist locale preference to localStorage
   */
  private persistLocale(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, this.locale);
    } catch {
      // localStorage unavailable
    }
  }

  /**
   * Notify all listeners of locale change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error('I18n listener error:', error);
      }
    });
  }

  /**
   * Set the current locale
   *
   * @param locale - Locale identifier to set
   * @throws Error if locale has no registered translations
   */
  setLocale(locale: Locale): void {
    if (!this.translations.has(locale) && !this.translations.has(this.fallbackLocale)) {
      throw new Error(`No translations registered for locale "${locale}" or fallback "${this.fallbackLocale}"`);
    }

    if (this.locale !== locale) {
      this.locale = locale;
      this.persistLocale();
      this.notifyListeners();
    }
  }

  /**
   * Get the current locale
   */
  getLocale(): Locale {
    return this.locale;
  }

  /**
   * Set the fallback locale
   *
   * @param locale - Locale to use when translation is missing
   */
  setFallbackLocale(locale: Locale): void {
    this.fallbackLocale = locale;
  }

  /**
   * Get the fallback locale
   */
  getFallbackLocale(): Locale {
    return this.fallbackLocale;
  }

  /**
   * Register translations for a locale
   *
   * @param locale - Locale identifier
   * @param translations - Translation dictionary
   * @param merge - If true, merge with existing translations (default: true)
   */
  registerTranslations(locale: Locale, translations: TranslationDict, merge = true): void {
    if (merge && this.translations.has(locale)) {
      const existing = this.translations.get(locale)!;
      this.translations.set(locale, this.deepMerge(existing, translations));
    } else {
      this.translations.set(locale, translations);
    }
  }

  /**
   * Deep merge two translation dictionaries
   */
  private deepMerge(target: TranslationDict, source: TranslationDict): TranslationDict {
    const result: TranslationDict = { ...target };

    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        typeof targetValue === 'object' &&
        targetValue !== null
      ) {
        result[key] = this.deepMerge(
          targetValue as TranslationDict,
          sourceValue as TranslationDict
        );
      } else {
        result[key] = sourceValue;
      }
    }

    return result;
  }

  /**
   * Get list of available locales
   */
  getAvailableLocales(): Locale[] {
    return Array.from(this.translations.keys());
  }

  /**
   * Check if a locale is available
   */
  hasLocale(locale: Locale): boolean {
    return this.translations.has(locale);
  }

  /**
   * Translate a key with optional parameter interpolation
   *
   * Key format: 'namespace.key' or 'namespace.nested.key'
   * Parameter format: 'Hello, {name}!' with params: { name: 'World' }
   *
   * @param key - Dot-notation translation key
   * @param params - Optional parameters for interpolation
   * @returns Translated string or key if not found
   */
  t(key: string, params?: TranslationParams): string {
    // Try current locale first
    let translation = this.lookupKey(key, this.locale);

    // Fall back to fallback locale
    if (translation === null && this.locale !== this.fallbackLocale) {
      translation = this.lookupKey(key, this.fallbackLocale);
    }

    // Return key if no translation found
    if (translation === null) {
      console.warn(`Missing translation for key "${key}" in locale "${this.locale}"`);
      return key;
    }

    // Interpolate parameters
    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  /**
   * Look up a key in a locale's translations
   *
   * @param key - Dot-notation key
   * @param locale - Locale to look up in
   * @returns Translation string or null if not found
   */
  private lookupKey(key: string, locale: Locale): string | null {
    const dict = this.translations.get(locale);
    if (!dict) return null;

    const parts = key.split('.');
    let current: string | TranslationDict = dict;

    for (const part of parts) {
      if (typeof current !== 'object' || current === null) {
        return null;
      }
      const dictValue: string | TranslationDict | undefined = (current as TranslationDict)[part];
      if (dictValue === undefined) {
        return null;
      }
      current = dictValue;
    }

    if (typeof current === 'string') {
      return current;
    }

    return null;
  }

  /**
   * Interpolate parameters into a translation string
   *
   * @param template - Template string with {param} placeholders
   * @param params - Parameter values
   * @returns Interpolated string
   */
  private interpolate(template: string, params: TranslationParams): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      if (key in params) {
        return String(params[key]);
      }
      return match;
    });
  }

  /**
   * Format a date according to the current locale
   *
   * @param date - Date to format
   * @param options - Intl.DateTimeFormat options
   * @returns Formatted date string
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Intl.DateTimeFormat(this.locale, options ?? defaultOptions).format(date);
  }

  /**
   * Format a number according to the current locale
   *
   * @param num - Number to format
   * @param options - Intl.NumberFormat options
   * @returns Formatted number string
   */
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(num);
  }

  /**
   * Format a currency amount
   *
   * @param amount - Numeric amount
   * @param currency - ISO 4217 currency code (default: 'USD')
   * @returns Formatted currency string
   */
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Format relative time (e.g., '2 hours ago', 'in 3 days')
   *
   * Uses Intl.RelativeTimeFormat for accurate localization.
   *
   * @param date - Target date to compare against now
   * @returns Formatted relative time string
   */
  formatRelativeTime(date: Date): string {
    const now = Date.now();
    const diff = date.getTime() - now;
    const absDiff = Math.abs(diff);

    // Define time units in milliseconds
    const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
      { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
      { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
      { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
      { unit: 'day', ms: 24 * 60 * 60 * 1000 },
      { unit: 'hour', ms: 60 * 60 * 1000 },
      { unit: 'minute', ms: 60 * 1000 },
      { unit: 'second', ms: 1000 },
    ];

    // Find the appropriate unit
    for (const { unit, ms } of units) {
      if (absDiff >= ms) {
        const value = Math.round(diff / ms);
        return new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' }).format(value, unit);
      }
    }

    // Less than a second
    return new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' }).format(0, 'second');
  }

  /**
   * Format a list according to locale
   *
   * @param items - Array of strings to format
   * @param options - Intl.ListFormat options
   * @returns Formatted list string
   */
  formatList(items: string[], options?: Intl.ListFormatOptions): string {
    const defaultOptions: Intl.ListFormatOptions = {
      style: 'long',
      type: 'conjunction',
    };

    return new Intl.ListFormat(this.locale, options ?? defaultOptions).format(items);
  }

  /**
   * Get the plural form for a count
   *
   * Uses Intl.PluralRules for accurate pluralization.
   *
   * @param count - Number to get plural form for
   * @returns Plural category: 'zero', 'one', 'two', 'few', 'many', 'other'
   */
  getPluralForm(count: number): Intl.LDMLPluralRule {
    return new Intl.PluralRules(this.locale).select(count);
  }

  /**
   * Subscribe to locale changes
   *
   * @param callback - Function to call when locale changes
   * @returns Unsubscribe function
   */
  subscribe(callback: LocaleChangeListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get all translations for current locale
   *
   * Useful for debugging or exporting.
   */
  getTranslations(locale?: Locale): TranslationDict | undefined {
    return this.translations.get(locale ?? this.locale);
  }
}

/**
 * Singleton i18n service instance
 */
export const i18n = new I18nServiceImpl();

/**
 * Export the class for testing purposes
 */
export { I18nServiceImpl };
