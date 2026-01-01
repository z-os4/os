/**
 * ToolbarGroup Component
 *
 * Groups related toolbar items with visual separation.
 *
 * @example
 * ```tsx
 * <Toolbar>
 *   <ToolbarGroup>
 *     <ToolbarButton item={{ id: 'cut', icon: <CutIcon /> }} />
 *     <ToolbarButton item={{ id: 'copy', icon: <CopyIcon /> }} />
 *     <ToolbarButton item={{ id: 'paste', icon: <PasteIcon /> }} />
 *   </ToolbarGroup>
 *   <ToolbarGroup>
 *     <ToolbarButton item={{ id: 'undo', icon: <UndoIcon /> }} />
 *     <ToolbarButton item={{ id: 'redo', icon: <RedoIcon /> }} />
 *   </ToolbarGroup>
 * </Toolbar>
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import type { ToolbarGroupProps } from './types';

export const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          'flex items-center gap-0.5',
          // Visual separator from other groups
          'relative',
          // Add border after the group (between groups)
          'after:content-[\'\'] after:absolute after:right-[-6px] after:top-1/2 after:-translate-y-1/2',
          'after:w-px after:h-4 after:bg-white/10',
          'last:after:hidden', // Hide separator for last group
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ToolbarGroup.displayName = 'ToolbarGroup';

/**
 * Toolbar separator - vertical divider between items
 */
export const ToolbarSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation="vertical"
    className={cn('w-px h-5 bg-white/10 mx-1.5 flex-shrink-0', className)}
    {...props}
  />
));

ToolbarSeparator.displayName = 'ToolbarSeparator';

/**
 * Toolbar spacer - flexible space between items
 */
export const ToolbarSpacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex-1', className)} {...props} />
));

ToolbarSpacer.displayName = 'ToolbarSpacer';

export default ToolbarGroup;
