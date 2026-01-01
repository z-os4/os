/**
 * Context Menu Types
 *
 * Type definitions for the context menu system.
 */

import type { ReactNode } from 'react';

/** Position coordinates for the context menu */
export interface ContextMenuPosition {
  x: number;
  y: number;
}

/** Base context menu item properties */
interface ContextMenuItemBase {
  /** Unique identifier for the menu item */
  id: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether to hide this item */
  hidden?: boolean;
}

/** Regular clickable menu item */
export interface ContextMenuActionItem extends ContextMenuItemBase {
  type?: 'item';
  /** Display label */
  label: string;
  /** Icon component */
  icon?: ReactNode;
  /** Keyboard shortcut display text (e.g., "Cmd+C") */
  shortcut?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether this is a destructive action (shows in red) */
  destructive?: boolean;
  /** Nested submenu items */
  submenu?: ContextMenuItem[];
}

/** Separator between menu items */
export interface ContextMenuSeparator extends ContextMenuItemBase {
  type: 'separator';
}

/** Checkbox menu item */
export interface ContextMenuCheckboxItem extends ContextMenuItemBase {
  type: 'checkbox';
  /** Display label */
  label: string;
  /** Icon component */
  icon?: ReactNode;
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
}

/** Radio group for mutually exclusive options */
export interface ContextMenuRadioGroup extends ContextMenuItemBase {
  type: 'radio-group';
  /** Display label for the group */
  label?: string;
  /** Currently selected value */
  value: string;
  /** Available options */
  options: Array<{
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
  }>;
  /** Change handler */
  onChange?: (value: string) => void;
}

/** Label/header item (non-interactive) */
export interface ContextMenuLabel extends ContextMenuItemBase {
  type: 'label';
  /** Display text */
  label: string;
}

/** Union of all menu item types */
export type ContextMenuItem =
  | ContextMenuActionItem
  | ContextMenuSeparator
  | ContextMenuCheckboxItem
  | ContextMenuRadioGroup
  | ContextMenuLabel;

/** Context menu state */
export interface ContextMenuState {
  /** Whether the menu is visible */
  isOpen: boolean;
  /** Current position of the menu */
  position: ContextMenuPosition;
  /** Menu items to display */
  items: ContextMenuItem[];
  /** Currently active submenu path (array of item ids) */
  activeSubmenuPath: string[];
  /** Currently focused item index */
  focusedIndex: number;
}

/** Context for the context menu provider */
export interface ContextMenuContextValue {
  /** Current menu state */
  state: ContextMenuState;
  /** Show the context menu */
  showContextMenu: (items: ContextMenuItem[], position: ContextMenuPosition) => void;
  /** Hide the context menu */
  hideContextMenu: () => void;
  /** Set the active submenu path */
  setActiveSubmenuPath: (path: string[]) => void;
  /** Set the focused item index */
  setFocusedIndex: (index: number) => void;
}

/** Props for the context menu trigger component */
export interface ContextMenuTriggerProps {
  /** Menu items to show on right-click */
  items: ContextMenuItem[];
  /** Child element(s) to wrap */
  children: ReactNode;
  /** Whether the trigger is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Callback when context menu opens */
  onOpen?: () => void;
  /** Callback when context menu closes */
  onClose?: () => void;
}

/** Props for the context menu component */
export interface ContextMenuProps {
  /** Menu items */
  items: ContextMenuItem[];
  /** Position to display at */
  position: ContextMenuPosition;
  /** Whether this is a submenu */
  isSubmenu?: boolean;
  /** Parent item id (for submenus) */
  parentPath?: string[];
  /** Callback when menu should close */
  onClose?: () => void;
}
