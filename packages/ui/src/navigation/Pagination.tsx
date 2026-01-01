/**
 * Pagination Component
 *
 * Page navigation with glass styling and accessibility support.
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={5}
 *   totalPages={20}
 *   onChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */

import React, { useMemo, useCallback } from 'react';
import { cn } from '../lib/utils';
import { NAV_SIZE_CLASSES, NAV_GLASS_STYLES, type NavSize } from './types';

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onChange: (page: number) => void;
  /** Number of siblings to show on each side of current page */
  siblingCount?: number;
  /** Show first page button */
  showFirst?: boolean;
  /** Show last page button */
  showLast?: boolean;
  /** Show prev/next buttons */
  showPrevNext?: boolean;
  /** Size variant */
  size?: NavSize;
  /** Additional class name */
  className?: string;
}

/** Chevron left icon */
const ChevronLeft: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

/** Chevron right icon */
const ChevronRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

/** Double chevron left (first) icon */
const ChevronsLeft: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 19l-7-7 7-7" />
  </svg>
);

/** Double chevron right (last) icon */
const ChevronsRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 5l7 7-7 7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
  </svg>
);

/** Generate pagination range */
function usePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  return useMemo(() => {
    // Total slots = first + last + current + siblings*2 + ellipsis*2
    const totalSlots = siblingCount * 2 + 5;

    if (totalPages <= totalSlots) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'ellipsis', totalPages];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, 'ellipsis', ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
  }, [currentPage, totalPages, siblingCount]);
}

/** Size-specific button dimensions */
const BUTTON_SIZES = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
} as const;

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onChange,
      siblingCount = 1,
      showFirst = true,
      showLast = true,
      showPrevNext = true,
      size = 'md',
      className,
    },
    ref
  ) => {
    const range = usePaginationRange(currentPage, totalPages, siblingCount);
    const sizeClasses = NAV_SIZE_CLASSES[size];

    const handlePageChange = useCallback(
      (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          onChange(page);
        }
      },
      [currentPage, totalPages, onChange]
    );

    const buttonBaseClasses = cn(
      BUTTON_SIZES[size],
      'rounded-lg flex items-center justify-center',
      sizeClasses.text,
      'transition-all',
      NAV_GLASS_STYLES.focus
    );

    const navButtonClasses = cn(
      buttonBaseClasses,
      'text-white/70 hover:text-white hover:bg-white/10',
      'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
    );

    const pageButtonClasses = (isActive: boolean) =>
      cn(
        buttonBaseClasses,
        isActive
          ? cn('text-white font-medium', NAV_GLASS_STYLES.active)
          : 'text-white/70 hover:text-white hover:bg-white/10'
      );

    if (totalPages <= 1) {
      return null;
    }

    return (
      <nav
        ref={ref}
        className={cn('flex items-center', sizeClasses.gap, className)}
        aria-label="Pagination"
      >
        {/* First button */}
        {showFirst && (
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={navButtonClasses}
            aria-label="First page"
          >
            <ChevronsLeft className={sizeClasses.icon} />
          </button>
        )}

        {/* Previous button */}
        {showPrevNext && (
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={navButtonClasses}
            aria-label="Previous page"
          >
            <ChevronLeft className={sizeClasses.icon} />
          </button>
        )}

        {/* Page numbers */}
        <div className={cn('flex items-center', sizeClasses.gap)}>
          {range.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={cn(
                    BUTTON_SIZES[size],
                    'flex items-center justify-center text-white/40'
                  )}
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = item === currentPage;

            return (
              <button
                key={item}
                type="button"
                onClick={() => handlePageChange(item)}
                className={pageButtonClasses(isActive)}
                aria-label={`Page ${item}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        {showPrevNext && (
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={navButtonClasses}
            aria-label="Next page"
          >
            <ChevronRight className={sizeClasses.icon} />
          </button>
        )}

        {/* Last button */}
        {showLast && (
          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={navButtonClasses}
            aria-label="Last page"
          >
            <ChevronsRight className={sizeClasses.icon} />
          </button>
        )}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';
