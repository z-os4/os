/**
 * Toolbar Module
 *
 * Window chrome components including Toolbar, StatusBar, and related utilities.
 */

// Types
export type {
  ToolbarItem,
  ToolbarItemType,
  ToolbarSize,
  ToolbarVariant,
  ToolbarProps,
  ToolbarButtonProps,
  ToolbarDropdownProps,
  ToolbarGroupProps,
  StatusBarItem,
  StatusBarAlignment,
  StatusBarProps,
  StatusBarItemProps,
  WindowChromeProps,
} from './types';

export {
  TOOLBAR_SIZE_CLASSES,
  TOOLBAR_BUTTON_SIZES,
  TOOLBAR_GLASS_STYLES,
  STATUS_BAR_GLASS_STYLES,
} from './types';

// Components
export { Toolbar } from './Toolbar';
export { ToolbarButton } from './ToolbarButton';
export { ToolbarDropdown } from './ToolbarDropdown';
export { ToolbarGroup, ToolbarSeparator, ToolbarSpacer } from './ToolbarGroup';
export { StatusBar } from './StatusBar';
export { StatusBarItem as StatusBarItemComponent } from './StatusBarItem';
export { WindowChrome } from './WindowChrome';

// Hooks
export { useToolbar, createToggleItems } from './useToolbar';
export type { UseToolbarResult } from './useToolbar';
