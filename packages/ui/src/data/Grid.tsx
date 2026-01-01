/**
 * Grid Component
 *
 * Responsive grid layout for displaying items with glass styling.
 *
 * @example
 * ```tsx
 * <Grid
 *   items={files}
 *   keyExtractor={(file) => file.id}
 *   renderItem={(file) => (
 *     <GridItem
 *       icon={<FileIcon type={file.type} />}
 *       label={file.name}
 *       subtitle={file.size}
 *     />
 *   )}
 *   columns={{ default: 2, sm: 3, md: 4, lg: 6 }}
 *   onItemClick={handleOpen}
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { cn } from '../lib/utils';
import type { SelectionMode, KeyExtractor, RenderFunction } from './types';

export interface GridColumns {
  /** Default columns */
  default: number;
  /** Columns at sm breakpoint (640px) */
  sm?: number;
  /** Columns at md breakpoint (768px) */
  md?: number;
  /** Columns at lg breakpoint (1024px) */
  lg?: number;
  /** Columns at xl breakpoint (1280px) */
  xl?: number;
}

export interface GridProps<T> {
  /** Array of items to display */
  items: T[];
  /** Extract unique key from item */
  keyExtractor: KeyExtractor<T>;
  /** Render function for each item */
  renderItem: RenderFunction<T>;
  /** Number of columns or responsive config */
  columns?: number | GridColumns;
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg';
  /** Callback when item is clicked */
  onItemClick?: (item: T) => void;
  /** Set of selected item keys */
  selectedKeys?: Set<string>;
  /** Callback when selection changes */
  onSelectionChange?: (selected: Set<string>) => void;
  /** Enable item selection */
  selectable?: SelectionMode;
  /** Message when no data */
  emptyMessage?: React.ReactNode;
  /** Show loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface GridItemProps {
  /** Icon or image to display */
  icon?: React.ReactNode;
  /** Main label */
  label?: React.ReactNode;
  /** Secondary text */
  subtitle?: React.ReactNode;
  /** Whether item is selected */
  selected?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Double click handler */
  onDoubleClick?: () => void;
  /** Children for custom content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      icon,
      label,
      subtitle,
      selected,
      disabled,
      onClick,
      onDoubleClick,
      children,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="gridcell"
        aria-selected={selected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'flex flex-col items-center gap-2 p-4 rounded-lg transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
          onClick && !disabled && 'cursor-pointer hover:bg-white/5',
          selected && 'bg-blue-500/20 ring-2 ring-blue-500/50',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        onClick={disabled ? undefined : onClick}
        onDoubleClick={disabled ? undefined : onDoubleClick}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            if (e.detail === 2 || e.shiftKey) {
              onDoubleClick?.();
            } else {
              onClick?.();
            }
          } else if (e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {children ?? (
          <>
            {icon && (
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/5 text-white/70">
                {icon}
              </div>
            )}
            {label && (
              <div className="text-sm font-medium text-white text-center truncate max-w-full">
                {label}
              </div>
            )}
            {subtitle && (
              <div className="text-xs text-white/50 text-center truncate max-w-full">
                {subtitle}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

function getColumnsClass(columns: number | GridColumns): string {
  if (typeof columns === 'number') {
    return `grid-cols-${columns}`;
  }

  const classes: string[] = [`grid-cols-${columns.default}`];
  if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
  if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
  if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
  if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);

  return classes.join(' ');
}

function GridInner<T>(
  {
    items,
    keyExtractor,
    renderItem,
    columns = 4,
    gap = 'md',
    onItemClick,
    selectedKeys,
    onSelectionChange,
    selectable,
    emptyMessage = 'No items',
    loading,
    className,
  }: GridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap];

  const handleItemClick = useCallback(
    (item: T) => {
      const key = keyExtractor(item);

      if (onSelectionChange && selectable) {
        const newSelected = new Set(selectedKeys);
        if (selectable === 'single') {
          newSelected.clear();
          if (!selectedKeys?.has(key)) {
            newSelected.add(key);
          }
        } else {
          if (newSelected.has(key)) {
            newSelected.delete(key);
          } else {
            newSelected.add(key);
          }
        }
        onSelectionChange(newSelected);
      }

      onItemClick?.(item);
    },
    [keyExtractor, onItemClick, onSelectionChange, selectable, selectedKeys]
  );

  if (loading) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center py-12 text-white/50', className)}
        role="grid"
        aria-busy="true"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-blue-500 rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center py-12 text-white/50', className)}
        role="grid"
      >
        {emptyMessage}
      </div>
    );
  }

  // Build inline style for grid columns to support dynamic values
  const columnStyle = typeof columns === 'number'
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        'grid',
        typeof columns !== 'number' && getColumnsClass(columns),
        gapClass,
        className
      )}
      style={typeof columns === 'number' ? columnStyle : undefined}
      role="grid"
      aria-multiselectable={selectable === 'multiple' || selectable === true}
    >
      {items.map((item, index) => {
        const key = keyExtractor(item, index);
        const isSelected = selectedKeys?.has(key);

        return (
          <div
            key={key}
            onClick={() => handleItemClick(item)}
            className={cn(isSelected && 'rounded-lg')}
          >
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}

export const Grid = React.forwardRef(GridInner) as <T>(
  props: GridProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

(Grid as React.FC).displayName = 'Grid';
