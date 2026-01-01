/**
 * GalleryLayout - Grid/list gallery with sidebar
 * 
 * Features:
 * - Header with title and view mode toggle
 * - Sidebar with category filters
 * - Grid/list view content area
 * - Footer with status/links
 * 
 * @example
 * <GalleryLayout
 *   header={{ title: 'Zoo Marketplace', icon: <Sparkles /> }}
 *   sidebar={<CategoryList items={categories} />}
 *   viewMode="grid"
 *   onViewModeChange={setViewMode}
 *   items={nfts.map(nft => <NFTCard key={nft.id} {...nft} />)}
 * />
 */

import React, { ReactNode, useState } from 'react';
import { Grid, List } from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewMode = 'grid' | 'list';

export interface GalleryLayoutHeader {
  icon?: ReactNode;
  title: string;
  actions?: ReactNode;
}

export interface GalleryLayoutProps {
  header?: GalleryLayoutHeader;
  sidebar?: ReactNode;
  sidebarWidth?: number;
  items: ReactNode;
  footer?: ReactNode;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  gridColumns?: number;
  className?: string;
  detailView?: ReactNode;
  onBackToGrid?: () => void;
}

export function GalleryLayout({
  header,
  sidebar,
  sidebarWidth = 192,
  items,
  footer,
  viewMode: controlledViewMode,
  onViewModeChange,
  showViewToggle = true,
  gridColumns = 3,
  className,
  detailView,
  onBackToGrid,
}: GalleryLayoutProps) {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('grid');
  const viewMode = controlledViewMode ?? internalViewMode;
  
  const handleViewModeChange = (mode: ViewMode) => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  return (
    <div className={cn('flex flex-col h-full bg-zos-bg-primary', className)}>
      {/* Header */}
      {header && (
        <div className="flex items-center justify-between p-4 border-b border-zos-border-primary">
          <div className="flex items-center gap-2">
            {header.icon && (
              <span className="text-purple-400">{header.icon}</span>
            )}
            <h1 className="text-zos-text-primary font-bold text-lg">{header.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {header.actions}
            {showViewToggle && !detailView && (
              <>
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid' ? 'bg-white/10' : 'hover:bg-white/5'
                  )}
                >
                  <Grid className="w-4 h-4 text-zos-text-secondary" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list' ? 'bg-white/10' : 'hover:bg-white/5'
                  )}
                >
                  <List className="w-4 h-4 text-zos-text-secondary" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <div 
            className="border-r border-zos-border-primary p-3 overflow-y-auto"
            style={{ width: sidebarWidth }}
          >
            {sidebar}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {detailView ? (
            <div>
              {onBackToGrid && (
                <button
                  onClick={onBackToGrid}
                  className="text-purple-400 text-sm mb-4 hover:underline"
                >
                  ← Back to gallery
                </button>
              )}
              {detailView}
            </div>
          ) : (
            <div 
              className={cn(
                'grid gap-4',
                viewMode === 'grid' 
                  ? `grid-cols-${gridColumns}` 
                  : 'grid-cols-1'
              )}
              style={viewMode === 'grid' ? { 
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` 
              } : undefined}
            >
              {items}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="p-3 border-t border-zos-border-primary">
          {footer}
        </div>
      )}
    </div>
  );
}

// Sidebar Section Component (prefixed to avoid conflict with Sidebar component)
export interface GallerySidebarSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function GallerySidebarSection({ title, children, className }: GallerySidebarSectionProps) {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-zos-text-muted text-xs uppercase tracking-wider px-3 py-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

// Sidebar Button Component
export interface SidebarButtonProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarButton({ icon, label, active, onClick }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
        active 
          ? 'bg-purple-500/20 text-purple-400' 
          : 'text-zos-text-secondary hover:bg-white/5'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// Gallery Card Component
export interface GalleryCardProps {
  image?: string;
  title: string;
  subtitle?: string;
  value?: string;
  metadata?: ReactNode;
  onClick?: () => void;
  viewMode?: ViewMode;
}

export function GalleryCard({
  image,
  title,
  subtitle,
  value,
  metadata,
  onClick,
  viewMode = 'grid',
}: GalleryCardProps) {
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative rounded-2xl overflow-hidden bg-white/5">
        {image && (
          <img
            src={image}
            alt=""
            className={cn(
              'w-full object-cover',
              viewMode === 'grid' ? 'aspect-square' : 'h-32'
            )}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium">
            View
          </button>
        </div>
      </div>
      <div className={cn('p-3', viewMode === 'list' && 'flex items-center justify-between')}>
        <div>
          {subtitle && <p className="text-purple-400 text-xs">{subtitle}</p>}
          <p className="text-zos-text-primary font-medium">{title}</p>
        </div>
        <div className={cn(viewMode === 'list' ? 'text-right' : 'flex items-center justify-between mt-2')}>
          {value && <p className="text-zos-text-primary font-bold">{value}</p>}
          {metadata}
        </div>
      </div>
    </div>
  );
}

export default GalleryLayout;
