/**
 * Breadcrumb Component
 *
 * Navigation breadcrumbs with glass styling and accessibility support.
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { id: 'home', label: 'Home', href: '/' },
 *     { id: 'products', label: 'Products', href: '/products' },
 *     { id: 'current', label: 'Widget' },
 *   ]}
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { cn } from '../lib/utils';
import type { BreadcrumbItem } from './types';
import { NAV_SIZE_CLASSES, type NavSize } from './types';

export type { BreadcrumbItem };

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator */
  separator?: React.ReactNode;
  /** Max items to show (collapses middle items) */
  maxItems?: number;
  /** Size variant */
  size?: NavSize;
  /** Additional class name */
  className?: string;
}

/** Default chevron separator */
const ChevronSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('w-4 h-4 text-white/30', className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

/** Ellipsis for collapsed items */
const EllipsisButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'px-2 py-1 rounded text-white/50 hover:text-white hover:bg-white/10',
      'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50',
      className
    )}
    aria-label="Show hidden items"
  >
    ...
  </button>
);

/** Individual breadcrumb item */
const BreadcrumbItemComponent: React.FC<{
  item: BreadcrumbItem;
  isLast: boolean;
  size: NavSize;
}> = ({ item, isLast, size }) => {
  const sizeClasses = NAV_SIZE_CLASSES[size];

  const content = (
    <>
      {item.icon && (
        <span className={cn('flex-shrink-0', sizeClasses.icon)}>
          {item.icon}
        </span>
      )}
      <span className="truncate">{item.label}</span>
    </>
  );

  const baseClasses = cn(
    'inline-flex items-center',
    sizeClasses.gap,
    sizeClasses.text,
    'transition-colors'
  );

  if (isLast) {
    return (
      <span
        className={cn(baseClasses, 'text-white font-medium')}
        aria-current="page"
      >
        {content}
      </span>
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        onClick={item.onClick}
        className={cn(
          baseClasses,
          'text-white/60 hover:text-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded'
        )}
      >
        {content}
      </a>
    );
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={cn(
          baseClasses,
          'text-white/60 hover:text-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded'
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={cn(baseClasses, 'text-white/60')}>{content}</span>
  );
};

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator = <ChevronSeparator />,
      maxItems,
      size = 'md',
      className,
    },
    ref
  ) => {
    const [expanded, setExpanded] = React.useState(false);

    const displayedItems = useMemo(() => {
      if (!maxItems || items.length <= maxItems || expanded) {
        return items;
      }

      // Show first, ellipsis, and last (maxItems - 1) items
      const lastItems = items.slice(-(maxItems - 1));
      return [items[0], null, ...lastItems];
    }, [items, maxItems, expanded]);

    if (items.length === 0) {
      return null;
    }

    return (
      <nav
        ref={ref}
        className={cn('flex items-center', className)}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center flex-wrap gap-1">
          {displayedItems.map((item, index) => {
            if (item === null) {
              return (
                <li key="ellipsis" className="flex items-center gap-1">
                  <EllipsisButton onClick={() => setExpanded(true)} />
                  {separator}
                </li>
              );
            }

            const isLast = index === displayedItems.length - 1;

            return (
              <li key={item.id} className="flex items-center gap-1">
                <BreadcrumbItemComponent
                  item={item}
                  isLast={isLast}
                  size={size}
                />
                {!isLast && (
                  <span className="flex-shrink-0" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
