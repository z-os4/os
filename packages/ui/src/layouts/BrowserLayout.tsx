/**
 * BrowserLayout - File/content browser interface
 * 
 * Features:
 * - Toolbar with navigation and search
 * - Optional sidebar
 * - Main content area
 * - Status bar
 * 
 * @example
 * <BrowserLayout
 *   toolbar={<FileToolbar onBack={goBack} onForward={goForward} />}
 *   sidebar={<FileTree items={folders} />}
 *   statusBar={<StatusBar itemCount={files.length} />}
 * >
 *   <FileGrid files={files} />
 * </BrowserLayout>
 */

import React, { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search, Grid, List, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

export type BrowserViewMode = 'grid' | 'list' | 'columns';

export interface BrowserLayoutProps {
  toolbar?: ReactNode;
  sidebar?: ReactNode;
  sidebarWidth?: number;
  children: ReactNode;
  statusBar?: ReactNode;
  className?: string;
}

export function BrowserLayout({
  toolbar,
  sidebar,
  sidebarWidth = 200,
  children,
  statusBar,
  className,
}: BrowserLayoutProps) {
  return (
    <div className={cn('flex flex-col h-full bg-zos-bg-primary', className)}>
      {/* Toolbar */}
      {toolbar && (
        <div className="border-b border-zos-border-primary">
          {toolbar}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <div 
            className="border-r border-zos-border-primary overflow-y-auto"
            style={{ width: sidebarWidth }}
          >
            {sidebar}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Status Bar */}
      {statusBar && (
        <div className="border-t border-zos-border-primary">
          {statusBar}
        </div>
      )}
    </div>
  );
}

// Browser Toolbar Component
export interface BrowserToolbarProps {
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  title?: string;
  path?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  viewMode?: BrowserViewMode;
  onViewModeChange?: (mode: BrowserViewMode) => void;
  showViewModes?: boolean;
  actions?: ReactNode;
}

export function BrowserToolbar({
  onBack,
  onForward,
  canGoBack = true,
  canGoForward = false,
  title,
  path,
  searchValue,
  onSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  showViewModes = true,
  actions,
}: BrowserToolbarProps) {
  return (
    <div className="flex items-center gap-3 p-2">
      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            canGoBack ? 'hover:bg-white/10 text-zos-text-secondary' : 'text-zos-text-muted opacity-50'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onForward}
          disabled={!canGoForward}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            canGoForward ? 'hover:bg-white/10 text-zos-text-secondary' : 'text-zos-text-muted opacity-50'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Title/Path */}
      <div className="flex-1 min-w-0">
        {title && <span className="text-zos-text-primary font-medium">{title}</span>}
        {path && !title && (
          <span className="text-zos-text-secondary text-sm truncate">{path}</span>
        )}
      </div>

      {/* Search */}
      {onSearchChange !== undefined && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zos-text-muted" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="pl-8 pr-3 py-1.5 w-48 bg-white/5 border border-zos-border-primary rounded-lg text-sm text-zos-text-primary placeholder-zos-text-muted focus:outline-none focus:border-zos-accent-primary"
          />
        </div>
      )}

      {/* View Mode Toggle */}
      {showViewModes && onViewModeChange && (
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-white/10 text-zos-text-primary' : 'text-zos-text-muted hover:text-zos-text-secondary'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-white/10 text-zos-text-primary' : 'text-zos-text-muted hover:text-zos-text-secondary'
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('columns')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'columns' ? 'bg-white/10 text-zos-text-primary' : 'text-zos-text-muted hover:text-zos-text-secondary'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actions */}
      {actions}
    </div>
  );
}

// Browser Sidebar Component
export interface BrowserSidebarItem {
  id: string;
  icon?: ReactNode;
  label: string;
  children?: BrowserSidebarItem[];
  expanded?: boolean;
}

export interface BrowserSidebarProps {
  items: BrowserSidebarItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  title?: string;
}

export function BrowserSidebar({ items, activeId, onSelect, title }: BrowserSidebarProps) {
  return (
    <div className="p-2">
      {title && (
        <h3 className="text-zos-text-muted text-xs uppercase tracking-wider px-2 py-1 mb-1">
          {title}
        </h3>
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
              activeId === item.id
                ? 'bg-zos-accent-primary text-white'
                : 'text-zos-text-secondary hover:bg-white/5'
            )}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Status Bar Component
export interface BrowserStatusBarProps {
  itemCount?: number;
  selectedCount?: number;
  message?: string;
  actions?: ReactNode;
}

export function BrowserStatusBar({ itemCount, selectedCount, message, actions }: BrowserStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 text-xs text-zos-text-muted">
      <div>
        {message || (
          <>
            {itemCount !== undefined && `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            {selectedCount !== undefined && selectedCount > 0 && ` (${selectedCount} selected)`}
          </>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default BrowserLayout;
