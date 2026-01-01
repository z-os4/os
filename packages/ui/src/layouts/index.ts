/**
 * zOS Layout System
 * 
 * Reusable layout components inspired by SwiftUI patterns.
 * These layouts provide consistent structure for common app patterns.
 */

// Types (LayoutSidebarItem and LayoutListItem prefixed to avoid conflicts with UI components)
export type { LayoutProps, HeaderAction, LayoutSidebarItem, TabItem, LayoutListItem, GalleryItem } from './types';

// ChatLayout - Messaging interfaces
export { ChatLayout } from './ChatLayout';
export type { ChatLayoutProps, ChatLayoutHeader } from './ChatLayout';

// ListDetailLayout - List views with detail panels
export { ListDetailLayout, ListItemRow } from './ListDetailLayout';
export type { ListDetailLayoutProps, ListItemRowProps } from './ListDetailLayout';

// GalleryLayout - Grid/list galleries
export { GalleryLayout, GallerySidebarSection, SidebarButton, GalleryCard } from './GalleryLayout';
export type { GalleryLayoutProps, GalleryLayoutHeader, ViewMode, GallerySidebarSectionProps, SidebarButtonProps, GalleryCardProps } from './GalleryLayout';

// SettingsLayout - Settings interfaces
export { SettingsLayout, SettingsSection, SettingsRow, ToggleSwitch, SettingsSelect } from './SettingsLayout';
export type { SettingsLayoutProps, SettingsSectionProps, SettingsRowProps, ToggleSwitchProps, SettingsSelectProps, SelectOption } from './SettingsLayout';

// BrowserLayout - File browsers
export { BrowserLayout, BrowserToolbar, BrowserSidebar, BrowserStatusBar } from './BrowserLayout';
export type { BrowserLayoutProps, BrowserToolbarProps, BrowserSidebarProps, BrowserSidebarItem, BrowserStatusBarProps, BrowserViewMode } from './BrowserLayout';
