/**
 * List Components
 *
 * macOS-style list view with selection support.
 *
 * @example
 * ```tsx
 * <List>
 *   <ListItem selected onClick={handleClick}>
 *     <ListItemIcon><File /></ListItemIcon>
 *     <ListItemContent>
 *       <ListItemTitle>Document.txt</ListItemTitle>
 *       <ListItemDescription>Modified today</ListItemDescription>
 *     </ListItemContent>
 *   </ListItem>
 * </List>
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';

export interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spacing between items */
  spacing?: 'none' | 'sm' | 'md';
}

export const List = React.forwardRef<HTMLDivElement, ListProps>(
  ({ className, spacing = 'sm', ...props }, ref) => {
    const spacingClass = {
      none: '',
      sm: 'space-y-1',
      md: 'space-y-2',
    }[spacing];

    return (
      <div
        ref={ref}
        role="list"
        className={cn('flex-1 overflow-y-auto', spacingClass, className)}
        {...props}
      />
    );
  }
);

List.displayName = 'List';

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether item is selected */
  selected?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Variant style */
  variant?: 'default' | 'ghost';
}

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ className, selected, disabled, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="listitem"
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
          variant === 'default' && 'hover:bg-white/5',
          variant === 'ghost' && 'hover:bg-white/5',
          selected && 'bg-blue-500/20 text-white',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      />
    );
  }
);

ListItem.displayName = 'ListItem';

export const ListItemIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-shrink-0 text-white/50', className)}
    {...props}
  />
));

ListItemIcon.displayName = 'ListItemIcon';

export const ListItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex-1 min-w-0', className)} {...props} />
));

ListItemContent.displayName = 'ListItemContent';

export const ListItemTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('block text-sm font-medium text-white truncate', className)}
    {...props}
  />
));

ListItemTitle.displayName = 'ListItemTitle';

export const ListItemDescription = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('block text-xs text-white/50 truncate', className)}
    {...props}
  />
));

ListItemDescription.displayName = 'ListItemDescription';

export const ListItemAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity', className)}
    {...props}
  />
));

ListItemAction.displayName = 'ListItemAction';

export const ListHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-3 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider',
      className
    )}
    {...props}
  />
));

ListHeader.displayName = 'ListHeader';
