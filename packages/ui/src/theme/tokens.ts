/**
 * zOS Theme Tokens
 *
 * Default theme values for dark and light modes.
 * Uses CSS custom properties for runtime switching.
 */

import type { ZOSTheme, ThemeColors } from './types';

const darkColors: ThemeColors = {
  background: {
    primary: '#000000',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
    elevated: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.4)',
    inverted: '#000000',
  },
  accent: {
    primary: '#007aff',
    secondary: '#5856d6',
    hover: '#0a84ff',
  },
  system: {
    red: '#ff3b30',
    orange: '#ff9500',
    yellow: '#ffcc00',
    green: '#28c840',
    blue: '#007aff',
    purple: '#af52de',
    pink: '#ff2d55',
    cyan: '#32d4de',
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(255, 255, 255, 0.05)',
    focus: 'rgba(0, 122, 255, 0.5)',
  },
  surface: {
    glass: 'rgba(30, 30, 30, 0.85)',
    glassHover: 'rgba(40, 40, 40, 0.9)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

const lightColors: ThemeColors = {
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f7',
    tertiary: '#e8e8ed',
    elevated: '#ffffff',
  },
  text: {
    primary: '#1d1d1f',
    secondary: 'rgba(29, 29, 31, 0.7)',
    muted: 'rgba(29, 29, 31, 0.4)',
    inverted: '#ffffff',
  },
  accent: {
    primary: '#007aff',
    secondary: '#5856d6',
    hover: '#0a84ff',
  },
  system: {
    red: '#ff3b30',
    orange: '#ff9500',
    yellow: '#ffcc00',
    green: '#28c840',
    blue: '#007aff',
    purple: '#af52de',
    pink: '#ff2d55',
    cyan: '#32d4de',
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.1)',
    secondary: 'rgba(0, 0, 0, 0.05)',
    focus: 'rgba(0, 122, 255, 0.5)',
  },
  surface: {
    glass: 'rgba(255, 255, 255, 0.85)',
    glassHover: 'rgba(255, 255, 255, 0.9)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
};

const sharedTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.2)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0.5px 0 rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: {
      sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
      mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', monospace",
    },
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '15px',
      lg: '17px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  transitions: {
    fast: '100ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
};

export const darkTheme: ZOSTheme = {
  mode: 'dark',
  colors: darkColors,
  ...sharedTokens,
};

export const lightTheme: ZOSTheme = {
  mode: 'light',
  colors: lightColors,
  ...sharedTokens,
};

export function getTheme(mode: 'light' | 'dark'): ZOSTheme {
  return mode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Convert theme tokens to CSS custom properties
 */
export function themeToCSSVariables(theme: ZOSTheme): Record<string, string> {
  const vars: Record<string, string> = {};

  // Colors
  vars['--zos-bg-primary'] = theme.colors.background.primary;
  vars['--zos-bg-secondary'] = theme.colors.background.secondary;
  vars['--zos-bg-tertiary'] = theme.colors.background.tertiary;
  vars['--zos-bg-elevated'] = theme.colors.background.elevated;

  vars['--zos-text-primary'] = theme.colors.text.primary;
  vars['--zos-text-secondary'] = theme.colors.text.secondary;
  vars['--zos-text-muted'] = theme.colors.text.muted;
  vars['--zos-text-inverted'] = theme.colors.text.inverted;

  vars['--zos-accent-primary'] = theme.colors.accent.primary;
  vars['--zos-accent-secondary'] = theme.colors.accent.secondary;
  vars['--zos-accent-hover'] = theme.colors.accent.hover;

  vars['--zos-system-red'] = theme.colors.system.red;
  vars['--zos-system-orange'] = theme.colors.system.orange;
  vars['--zos-system-yellow'] = theme.colors.system.yellow;
  vars['--zos-system-green'] = theme.colors.system.green;
  vars['--zos-system-blue'] = theme.colors.system.blue;
  vars['--zos-system-purple'] = theme.colors.system.purple;
  vars['--zos-system-pink'] = theme.colors.system.pink;
  vars['--zos-system-cyan'] = theme.colors.system.cyan;

  vars['--zos-border-primary'] = theme.colors.border.primary;
  vars['--zos-border-secondary'] = theme.colors.border.secondary;
  vars['--zos-border-focus'] = theme.colors.border.focus;

  vars['--zos-surface-glass'] = theme.colors.surface.glass;
  vars['--zos-surface-glass-hover'] = theme.colors.surface.glassHover;
  vars['--zos-surface-overlay'] = theme.colors.surface.overlay;

  // Spacing
  vars['--zos-spacing-xs'] = theme.spacing.xs;
  vars['--zos-spacing-sm'] = theme.spacing.sm;
  vars['--zos-spacing-md'] = theme.spacing.md;
  vars['--zos-spacing-lg'] = theme.spacing.lg;
  vars['--zos-spacing-xl'] = theme.spacing.xl;
  vars['--zos-spacing-2xl'] = theme.spacing['2xl'];
  vars['--zos-spacing-3xl'] = theme.spacing['3xl'];

  // Border radius
  vars['--zos-radius-none'] = theme.borderRadius.none;
  vars['--zos-radius-sm'] = theme.borderRadius.sm;
  vars['--zos-radius-md'] = theme.borderRadius.md;
  vars['--zos-radius-lg'] = theme.borderRadius.lg;
  vars['--zos-radius-xl'] = theme.borderRadius.xl;
  vars['--zos-radius-2xl'] = theme.borderRadius['2xl'];
  vars['--zos-radius-full'] = theme.borderRadius.full;

  // Shadows
  vars['--zos-shadow-none'] = theme.shadows.none;
  vars['--zos-shadow-sm'] = theme.shadows.sm;
  vars['--zos-shadow-md'] = theme.shadows.md;
  vars['--zos-shadow-lg'] = theme.shadows.lg;
  vars['--zos-shadow-xl'] = theme.shadows.xl;
  vars['--zos-shadow-glass'] = theme.shadows.glass;

  // Typography
  vars['--zos-font-sans'] = theme.typography.fontFamily.sans;
  vars['--zos-font-mono'] = theme.typography.fontFamily.mono;
  vars['--zos-text-xs'] = theme.typography.fontSize.xs;
  vars['--zos-text-sm'] = theme.typography.fontSize.sm;
  vars['--zos-text-base'] = theme.typography.fontSize.base;
  vars['--zos-text-lg'] = theme.typography.fontSize.lg;
  vars['--zos-text-xl'] = theme.typography.fontSize.xl;
  vars['--zos-text-2xl'] = theme.typography.fontSize['2xl'];
  vars['--zos-text-3xl'] = theme.typography.fontSize['3xl'];
  vars['--zos-text-4xl'] = theme.typography.fontSize['4xl'];

  // Transitions
  vars['--zos-transition-fast'] = theme.transitions.fast;
  vars['--zos-transition-normal'] = theme.transitions.normal;
  vars['--zos-transition-slow'] = theme.transitions.slow;

  return vars;
}
