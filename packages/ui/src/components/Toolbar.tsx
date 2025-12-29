/**
 * Toolbar Component
 *
 * macOS-style toolbar for window headers and action bars.
 *
 * @example
 * ```tsx
 * <Toolbar>
 *   <ToolbarGroup>
 *     <ToolbarButton icon={<Plus />} />
 *     <ToolbarButton icon={<Search />} />
 *   </ToolbarGroup>
 *   <ToolbarSpacer />
 *   <ToolbarGroup>
 *     <ToolbarButton icon={<Settings />} />
 *   </ToolbarGroup>
 * </Toolbar>
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position variant */
  position?: 'top' | 'bottom';
  /** Show border */
  bordered?: boolean;
}

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, position = 'top', bordered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="toolbar"
        className={cn(
          'flex items-center justify-between px-2 py-1.5 bg-black/20',
          bordered && position === 'top' && 'border-b border-white/10',
          bordered && position === 'bottom' && 'border-t border-white/10',
          className
        )}
        {...props}
      />
    );
  }
);

Toolbar.displayName = 'Toolbar';

export const ToolbarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-1', className)}
    {...props}
  />
));

ToolbarGroup.displayName = 'ToolbarGroup';

export const ToolbarSpacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex-1', className)} {...props} />
));

ToolbarSpacer.displayName = 'ToolbarSpacer';

export interface ToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether button is active */
  active?: boolean;
}

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(({ className, icon, active, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'p-1.5 rounded-md transition-colors',
      'hover:bg-white/10 active:bg-white/15',
      'text-white/70 hover:text-white',
      active && 'bg-white/10 text-white',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    {...props}
  >
    {icon}
    {children}
  </button>
));

ToolbarButton.displayName = 'ToolbarButton';

export const ToolbarDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('w-px h-5 bg-white/10 mx-1', className)}
    {...props}
  />
));

ToolbarDivider.displayName = 'ToolbarDivider';

export const ToolbarTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('text-sm font-medium text-white/70', className)}
    {...props}
  />
));

ToolbarTitle.displayName = 'ToolbarTitle';
