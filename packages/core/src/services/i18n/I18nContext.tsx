/**
 * I18n Context for zOS
 *
 * Provides React context wrapper around the i18n service.
 * Enables reactive updates when locale changes.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { Locale, I18nContextValue, TranslationParams } from './types';
import { i18n } from './I18nService';

/**
 * React context for i18n operations
 */
const I18nContext = createContext<I18nContextValue | null>(null);
I18nContext.displayName = 'I18nContext';

/**
 * Props for I18nProvider
 */
export interface I18nProviderProps {
  /** Default locale to use (overrides persisted preference) */
  defaultLocale?: Locale;
  /** React children */
  children: React.ReactNode;
}

/**
 * Provider component for i18n context
 *
 * Wraps children with internationalization functionality.
 * Subscribes to i18n service changes for reactive updates.
 *
 * @example
 * ```tsx
 * <I18nProvider defaultLocale="en">
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({
  defaultLocale,
  children,
}: I18nProviderProps): React.ReactElement {
  // Initialize locale from service or default
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (defaultLocale && i18n.hasLocale(defaultLocale)) {
      i18n.setLocale(defaultLocale);
      return defaultLocale;
    }
    return i18n.getLocale();
  });

  // Subscribe to locale changes from service
  useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      setLocaleState(i18n.getLocale());
    });

    return unsubscribe;
  }, []);

  // Memoized locale setter
  const setLocale = useCallback((newLocale: Locale): void => {
    i18n.setLocale(newLocale);
  }, []);

  // Memoized translation function
  const t = useCallback((key: string, params?: TranslationParams): string => {
    return i18n.t(key, params);
  }, [locale]); // Re-create when locale changes to trigger re-renders

  // Memoized date formatter
  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      return i18n.formatDate(date, options);
    },
    [locale]
  );

  // Memoized number formatter
  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions): string => {
      return i18n.formatNumber(num, options);
    },
    [locale]
  );

  // Memoized currency formatter
  const formatCurrency = useCallback(
    (amount: number, currency?: string): string => {
      return i18n.formatCurrency(amount, currency);
    },
    [locale]
  );

  // Memoized relative time formatter
  const formatRelativeTime = useCallback(
    (date: Date): string => {
      return i18n.formatRelativeTime(date);
    },
    [locale]
  );

  // Memoized available locales
  const availableLocales = useMemo<Locale[]>(() => {
    return i18n.getAvailableLocales();
  }, []); // Only compute once since locales don't change often

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
      availableLocales,
    }),
    [
      locale,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
      availableLocales,
    ]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Access i18n context
 *
 * Must be used within an I18nProvider.
 *
 * @throws Error if used outside I18nProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, setLocale } = useI18n();
 *
 *   return (
 *     <div>
 *       <p>{t('common.greeting', { name: 'World' })}</p>
 *       <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *         <option value="en">English</option>
 *         <option value="es">Spanish</option>
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export { I18nContext };
