/**
 * zOS Layout System Types
 * 
 * Common types for reusable layout components inspired by SwiftUI patterns.
 */

import { ReactNode } from 'react';

// Common layout props
export interface LayoutProps {
  children?: ReactNode;
  className?: string;
}

// Header with action buttons
export interface HeaderAction {
  icon: ReactNode;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

// Sidebar item for navigation (prefixed to avoid conflicts with Sidebar component)
export interface LayoutSidebarItem {
  id: string;
  icon?: ReactNode;
  label: string;
  badge?: string | number;
  children?: LayoutSidebarItem[];
}

// Tab definition
export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

// List item with icon and metadata (prefixed to avoid conflicts with List component)
export interface LayoutListItem<T = unknown> {
  id: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  metadata?: T;
  onClick?: () => void;
}

// Gallery item
export interface GalleryItem<T = unknown> {
  id: string;
  image?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  metadata?: T;
}
