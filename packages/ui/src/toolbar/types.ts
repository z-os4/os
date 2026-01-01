/**
 * Toolbar and StatusBar Types
 *
 * Type definitions for window chrome components.
 */

import type { ReactNode } from 'react';

/**
 * Types of toolbar items
 */
export type ToolbarItemType =
  | 'button'
  | 'toggle'
  | 'dropdown'
  | 'separator'
  | 'spacer'
  | 'custom';

/**
 * Individual toolbar item configuration
 */
export interface ToolbarItem {
  /** Unique identifier */
  id: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Text label */
  label?: string;
  /** Tooltip text on hover */
  tooltip?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is in active/pressed state (for toggle) */
  active?: boolean;
  /** Type of toolbar item */
  type?: ToolbarItemType;
  /** Child items for dropdown */
  children?: ToolbarItem[];
  /** Custom render function */
  render?: () => ReactNode;
}

/**
 * Size variants for toolbar
 */
export type ToolbarSize = 'sm' | 'md' | 'lg';

/**
 * Visual variants for toolbar
 */
export type ToolbarVariant = 'default' | 'transparent' | 'solid';

/**
 * Toolbar component props
 */
export interface ToolbarProps {
  /** Array of toolbar items */
  items: ToolbarItem[];
  /** Size variant */
  size?: ToolbarSize;
  /** Visual variant */
  variant?: ToolbarVariant;
  /** Additional class name */
  className?: string;
}

/**
 * Toolbar button props
 */
export interface ToolbarButtonProps {
  /** Item configuration */
  item: ToolbarItem;
  /** Size variant */
  size?: ToolbarSize;
}

/**
 * Toolbar dropdown props
 */
export interface ToolbarDropdownProps {
  /** Item configuration with children */
  item: ToolbarItem;
  /** Size variant */
  size?: ToolbarSize;
}

/**
 * Toolbar group props
 */
export interface ToolbarGroupProps {
  /** Child elements */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Alignment options for status bar items
 */
export type StatusBarAlignment = 'left' | 'center' | 'right';

/**
 * Individual status bar item configuration
 */
export interface StatusBarItem {
  /** Unique identifier */
  id: string;
  /** Content to display */
  content: ReactNode;
  /** Position alignment */
  align?: StatusBarAlignment;
  /** Click handler */
  onClick?: () => void;
  /** Tooltip text */
  tooltip?: string;
}

/**
 * Status bar component props
 */
export interface StatusBarProps {
  /** Array of status bar items */
  items?: StatusBarItem[];
  /** Content for left section */
  leftContent?: ReactNode;
  /** Content for center section */
  centerContent?: ReactNode;
  /** Content for right section */
  rightContent?: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Status bar item component props
 */
export interface StatusBarItemProps {
  /** Item configuration */
  item: StatusBarItem;
}

/**
 * Window chrome component props
 */
export interface WindowChromeProps {
  /** Window title */
  title?: string;
  /** Toolbar items */
  toolbar?: ToolbarItem[];
  /** Status bar items */
  statusBar?: StatusBarItem[];
  /** Whether to show toolbar */
  showToolbar?: boolean;
  /** Whether to show status bar */
  showStatusBar?: boolean;
  /** Window content */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Size class mappings for toolbar
 */
export const TOOLBAR_SIZE_CLASSES: Record<
  ToolbarSize,
  { height: string; padding: string; text: string; icon: string; gap: string }
> = {
  sm: {
    height: 'h-8',
    padding: 'px-1.5 py-1',
    text: 'text-xs',
    icon: 'w-3.5 h-3.5',
    gap: 'gap-0.5',
  },
  md: {
    height: 'h-10',
    padding: 'px-2 py-1.5',
    text: 'text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-1',
  },
  lg: {
    height: 'h-12',
    padding: 'px-3 py-2',
    text: 'text-base',
    icon: 'w-5 h-5',
    gap: 'gap-1.5',
  },
};

/**
 * Button size mappings for toolbar items
 */
export const TOOLBAR_BUTTON_SIZES: Record<
  ToolbarSize,
  { padding: string; minWidth: string }
> = {
  sm: { padding: 'p-1', minWidth: 'min-w-6' },
  md: { padding: 'p-1.5', minWidth: 'min-w-8' },
  lg: { padding: 'p-2', minWidth: 'min-w-10' },
};

/**
 * Glass styling constants
 */
export const TOOLBAR_GLASS_STYLES = {
  default: 'bg-black/30 backdrop-blur-lg border-b border-white/10',
  transparent: 'bg-transparent',
  solid: 'bg-zinc-900/95 border-b border-white/10',
};

export const STATUS_BAR_GLASS_STYLES = {
  base: 'bg-black/30 backdrop-blur-lg border-t border-white/10',
};
