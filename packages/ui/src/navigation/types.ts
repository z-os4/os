/**
 * Navigation Types
 *
 * Shared types for navigation components.
 */

import type React from 'react';

/** Navigation size variants */
export type NavSize = 'sm' | 'md' | 'lg';

/** Navigation item representing a link or action */
export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: React.ReactNode;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Link destination */
  href?: string;
  /** Click handler */
  onClick?: () => void;
  /** Nested items for dropdowns/submenus */
  children?: NavItem[];
  /** Whether item is disabled */
  disabled?: boolean;
  /** Badge content */
  badge?: React.ReactNode;
}

/** Breadcrumb item */
export interface BreadcrumbItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: React.ReactNode;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Link destination */
  href?: string;
  /** Click handler */
  onClick?: () => void;
}

/** Step in a stepper */
export interface Step {
  /** Unique identifier */
  id: string;
  /** Step label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Whether step is optional */
  optional?: boolean;
  /** Whether step has error */
  error?: boolean;
}

/** Sidebar section */
export interface SidebarSection {
  /** Unique identifier */
  id: string;
  /** Section title */
  title?: string;
  /** Section items */
  items: NavItem[];
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/** Size class mappings for navigation components */
export const NAV_SIZE_CLASSES = {
  sm: {
    text: 'text-xs',
    padding: 'px-2 py-1',
    gap: 'gap-1',
    icon: 'w-3.5 h-3.5',
    height: 'h-7',
  },
  md: {
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    gap: 'gap-2',
    icon: 'w-4 h-4',
    height: 'h-9',
  },
  lg: {
    text: 'text-base',
    padding: 'px-4 py-2',
    gap: 'gap-3',
    icon: 'w-5 h-5',
    height: 'h-11',
  },
} as const;

/** Glass styling constants for navigation */
export const NAV_GLASS_STYLES = {
  base: 'bg-black/40 backdrop-blur-xl border border-white/10',
  hover: 'hover:bg-white/10 hover:border-white/20',
  active: 'bg-blue-500/20 border-white/20',
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
} as const;
