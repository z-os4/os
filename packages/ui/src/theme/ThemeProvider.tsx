/**
 * zOS ThemeProvider
 *
 * Provides theme context and applies CSS custom properties to the document.
 * Supports dark/light modes with system preference detection.
 */

import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ThemeMode, ThemeContextValue, ZOSTheme } from './types';
import { darkTheme, lightTheme, themeToCSSVariables } from './tokens';

const THEME_STORAGE_KEY = 'zos-theme-mode';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme mode. Defaults to 'system'. */
  defaultMode?: ThemeMode;
  /** If true, persists theme preference to localStorage. Defaults to true. */
  persistPreference?: boolean;
}

export function ThemeProvider({
  children,
  defaultMode,
  persistPreference = true,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (defaultMode) return defaultMode;
    if (persistPreference) return getStoredMode();
    return 'system';
  });

  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(getSystemPreference);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Listen for storage changes (from settings panel)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newMode = e.newValue as ThemeMode;
        if (newMode === 'light' || newMode === 'dark' || newMode === 'system') {
          setModeState(newMode);
        }
      }
    };

    // Also listen for custom event from same window
    const handleThemeChange = (e: CustomEvent<ThemeMode>) => {
      setModeState(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('zos:theme-change', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('zos:theme-change', handleThemeChange as EventListener);
    };
  }, []);

  // Resolve the actual mode (light or dark)
  const resolvedMode: 'light' | 'dark' = mode === 'system' ? systemPreference : mode;

  // Get the theme object
  const theme: ZOSTheme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  // Apply CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    const vars = themeToCSSVariables(theme);

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', resolvedMode);

    // Set color-scheme for native elements
    root.style.colorScheme = resolvedMode;
  }, [theme, resolvedMode]);

  // Mode setter with persistence
  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
      if (persistPreference) {
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
      }
    },
    [persistPreference]
  );

  // Toggle between light and dark (skipping system)
  const toggleMode = useCallback(() => {
    const newMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [resolvedMode, setMode]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      resolvedMode,
      setMode,
      toggleMode,
    }),
    [theme, mode, resolvedMode, setMode, toggleMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
