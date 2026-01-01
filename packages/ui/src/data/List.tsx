/**
 * List Component
 *
 * Flexible list component with selection, virtualization support, and glass styling.
 *
 * @example
 * ```tsx
 * <DataList
 *   items={messages}
 *   keyExtractor={(msg) => msg.id}
 *   renderItem={(msg) => (
 *     <DataListItem
 *       leadingIcon={<User />}
 *       subtitle={msg.timestamp}
 *     >
 *       {msg.text}
 *     </DataListItem>
 *   )}
 *   onItemClick={handleSelect}
 * />
 * ```
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import type { SelectionMode, KeyExtractor, RenderFunction } from './types';

export interface DataListProps<T> {
  /** Array of items to display */
  items: T[];
  /** Extract unique key from item */
  keyExtractor: KeyExtractor<T>;
  /** Render function for each item */
  renderItem: RenderFunction<T>;
  /** Callback when item is clicked */
  onItemClick?: (item: T) => void;
  /** Set of selected item keys */
  selectedKeys?: Set<string>;
  /** Callback when selection changes */
  onSelectionChange?: (selected: Set<string>) => void;
  /** Enable item selection */
  selectable?: SelectionMode;
  /** Message or element when list is empty */
  emptyMessage?: React.ReactNode;
  /** Show loading state */
  loading?: boolean;
  /** Enable virtualization for large lists */
  virtualized?: boolean;
  /** Fixed item height for virtualization (required when virtualized) */
  itemHeight?: number;
  /** Additional CSS classes */
  className?: string;
}

export interface DataListItemProps {
  /** Content of the list item */
  children: React.ReactNode;
  /** Whether item is selected */
  selected?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Icon or element before content */
  leadingIcon?: React.ReactNode;
  /** Content after main content */
  trailingContent?: React.ReactNode;
  /** Secondary text below main content */
  subtitle?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const DataListItem = React.forwardRef<HTMLDivElement, DataListItemProps>(
  (
    {
      children,
      selected,
      disabled,
      leadingIcon,
      trailingContent,
      subtitle,
      onClick,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
          onClick && !disabled && 'cursor-pointer hover:bg-white/5',
          selected && 'bg-blue-500/20 text-white',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        onClick={disabled ? undefined : onClick}
        onKeyDown={(e) => {
          if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {leadingIcon && (
          <div className="flex-shrink-0 text-white/50">{leadingIcon}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{children}</div>
          {subtitle && (
            <div className="text-xs text-white/50 truncate">{subtitle}</div>
          )}
        </div>
        {trailingContent && (
          <div className="flex-shrink-0 text-white/50">{trailingContent}</div>
        )}
      </div>
    );
  }
);

DataListItem.displayName = 'DataListItem';

function VirtualizedList<T>({
  items,
  keyExtractor,
  renderItem,
  itemHeight,
  onItemClick,
  selectedKeys,
  onSelectionChange,
  selectable,
  containerHeight,
}: {
  items: T[];
  keyExtractor: KeyExtractor<T>;
  renderItem: RenderFunction<T>;
  itemHeight: number;
  onItemClick?: (item: T) => void;
  selectedKeys?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  selectable?: SelectionMode;
  containerHeight: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
  const endIndex = Math.min(items.length, startIndex + visibleCount);

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

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

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, i) => {
          const actualIndex = startIndex + i;
          const key = keyExtractor(item, actualIndex);
          const isSelected = selectedKeys?.has(key);

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
              onClick={() => handleItemClick(item)}
              className={cn(
                'transition-colors',
                isSelected && 'bg-blue-500/10'
              )}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DataListInner<T>(
  {
    items,
    keyExtractor,
    renderItem,
    onItemClick,
    selectedKeys,
    onSelectionChange,
    selectable,
    emptyMessage = 'No items',
    loading,
    virtualized,
    itemHeight = 48,
    className,
  }: DataListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    if (!virtualized || !containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [virtualized]);

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
        role="listbox"
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
        role="listbox"
      >
        {emptyMessage}
      </div>
    );
  }

  if (virtualized) {
    return (
      <div ref={ref} className={cn('flex-1', className)}>
        <div ref={containerRef} className="h-full" role="listbox">
          <VirtualizedList
            items={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            itemHeight={itemHeight}
            onItemClick={onItemClick}
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
            selectable={selectable}
            containerHeight={containerHeight}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto space-y-1', className)}
      role="listbox"
      aria-multiselectable={selectable === 'multiple' || selectable === true}
    >
      {items.map((item, index) => {
        const key = keyExtractor(item, index);
        const isSelected = selectedKeys?.has(key);

        return (
          <div
            key={key}
            onClick={() => handleItemClick(item)}
            className={cn(
              'transition-colors',
              isSelected && 'bg-blue-500/10 rounded-lg'
            )}
          >
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}

export const DataList = React.forwardRef(DataListInner) as <T>(
  props: DataListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

(DataList as React.FC).displayName = 'DataList';
