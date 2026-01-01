/**
 * zOS Theme System Type Definitions
 *
 * Defines the structure for theme tokens including colors, spacing,
 * typography, and other design tokens.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverted: string;
  };
  accent: {
    primary: string;
    secondary: string;
    hover: string;
  };
  system: {
    red: string;
    orange: string;
    yellow: string;
    green: string;
    blue: string;
    purple: string;
    pink: string;
    cyan: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  surface: {
    glass: string;
    glassHover: string;
    overlay: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glass: string;
}

export interface ThemeTypography {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ThemeTransitions {
  fast: string;
  normal: string;
  slow: string;
}

export interface ZOSTheme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  typography: ThemeTypography;
  transitions: ThemeTransitions;
}

export interface ThemeContextValue {
  theme: ZOSTheme;
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}
