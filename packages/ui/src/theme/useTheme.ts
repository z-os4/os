/**
 * useTheme Hook
 *
 * Provides access to the current theme context including:
 * - Current theme tokens
 * - Theme mode (light/dark/system)
 * - Methods to change the theme
 */

import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { ThemeContextValue } from './types';

/**
 * Hook to access the current theme context.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, mode, toggleMode } = useTheme();
 *
 *   return (
 *     <div style={{ background: theme.colors.background.primary }}>
 *       <button onClick={toggleMode}>
 *         Current mode: {mode}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to check if dark mode is active.
 */
export function useIsDarkMode(): boolean {
  const { resolvedMode } = useTheme();
  return resolvedMode === 'dark';
}

/**
 * Hook to get the current color tokens.
 */
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Hook to get the current spacing tokens.
 */
export function useSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

export default useTheme;
