/**
 * zOS Theme System
 *
 * Unified theming for zOS with dark/light mode support,
 * system preference detection, and CSS custom properties.
 */

// Types
export type {
  ThemeMode,
  ThemeColors,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeTypography,
  ThemeTransitions,
  ZOSTheme,
  ThemeContextValue,
} from './types';

// Tokens
export {
  darkTheme,
  lightTheme,
  getTheme,
  themeToCSSVariables,
} from './tokens';

// Provider
export { ThemeProvider, ThemeContext } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';

// Hooks
export {
  useTheme,
  useIsDarkMode,
  useColors,
  useSpacing,
} from './useTheme';
