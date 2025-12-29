/**
 * Sidebar Component
 *
 * macOS-style sidebar navigation.
 *
 * @example
 * ```tsx
 * <Sidebar>
 *   <SidebarSection title="Library">
 *     <SidebarItem icon={<Music />} active>Music</SidebarItem>
 *     <SidebarItem icon={<Film />}>Movies</SidebarItem>
 *   </SidebarSection>
 * </Sidebar>
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of sidebar */
  width?: number | string;
  /** Show border on right */
  bordered?: boolean;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, width = 200, bordered = true, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col bg-black/30 overflow-hidden',
          bordered && 'border-r border-white/10',
          className
        )}
        style={{ width, ...style }}
        {...props}
      />
    );
  }
);

Sidebar.displayName = 'Sidebar';

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title?: string;
  /** Collapsible */
  collapsible?: boolean;
}

export const SidebarSection = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('py-2', className)} {...props}>
        {title && (
          <div className="px-3 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider">
            {title}
          </div>
        )}
        <div className="px-2 space-y-0.5">{children}</div>
      </div>
    );
  }
);

SidebarSection.displayName = 'SidebarSection';

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether item is active/selected */
  active?: boolean;
  /** Badge count */
  badge?: number | string;
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, icon, active, badge, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          'text-white/70 hover:bg-white/5 hover:text-white',
          active && 'bg-blue-500/20 text-white',
          'disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0 w-5 h-5">{icon}</span>}
        <span className="flex-1 text-left truncate">{children}</span>
        {badge !== undefined && (
          <span className="flex-shrink-0 text-xs text-white/40 tabular-nums">
            {badge}
          </span>
        )}
      </button>
    );
  }
);

SidebarItem.displayName = 'SidebarItem';

export const SidebarDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('h-px bg-white/10 my-2 mx-3', className)}
    {...props}
  />
));

SidebarDivider.displayName = 'SidebarDivider';

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-auto p-2 border-t border-white/10', className)}
    {...props}
  />
));

SidebarFooter.displayName = 'SidebarFooter';
