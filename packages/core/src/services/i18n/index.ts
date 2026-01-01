/**
 * Internationalization (i18n) Service for zOS
 *
 * Provides translation and localization support:
 * - Translation lookup with fallback chains
 * - Parameter interpolation
 * - Date, number, currency formatting via Intl APIs
 * - Relative time formatting
 * - Locale persistence in localStorage
 * - React context and hooks integration
 *
 * @example
 * ```tsx
 * // Setup
 * import { I18nProvider, i18n } from '@z-os/core/services/i18n';
 *
 * // Register additional translations
 * i18n.registerTranslations('fr', {
 *   common: { ok: 'D\'accord', cancel: 'Annuler' }
 * });
 *
 * // In app root
 * <I18nProvider defaultLocale="en">
 *   <App />
 * </I18nProvider>
 *
 * // In components
 * function MyComponent() {
 *   const { t, formatDate, locale, setLocale } = useI18n();
 *
 *   return (
 *     <div>
 *       <h1>{t('common.greeting', { name: 'World' })}</h1>
 *       <p>{formatDate(new Date())}</p>
 *       <button onClick={() => setLocale('fr')}>Francais</button>
 *     </div>
 *   );
 * }
 * ```
 */

// Types
export type {
  Locale,
  TranslationDict,
  TranslationParams,
  LocaleConfig,
  I18nContextValue,
  LocaleChangeListener,
  I18nState,
} from './types';

export { LOCALE_STORAGE_KEY, DEFAULT_LOCALE } from './types';

// Service
export { i18n, I18nServiceImpl } from './I18nService';

// Default translations
export { EN_TRANSLATIONS, ES_TRANSLATIONS } from './defaultTranslations';

// React context and provider
export { I18nProvider, useI18n, I18nContext } from './I18nContext';
export type { I18nProviderProps } from './I18nContext';

// Hooks
export {
  useTranslation,
  useFormattedDate,
  useFormattedNumber,
  useLocale,
  useNamespacedTranslation,
  useTranslationWithDefault,
} from './useTranslation';

export type {
  UseTranslationResult,
  UseFormattedDateResult,
  UseFormattedNumberResult,
  UseLocaleResult,
} from './useTranslation';
