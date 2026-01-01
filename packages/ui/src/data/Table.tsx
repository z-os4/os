/**
 * Table Component
 *
 * Data table with sorting, selection, and glass styling.
 *
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { id: 'name', header: 'Name', accessor: 'name', sortable: true },
 *     { id: 'email', header: 'Email', accessor: 'email' },
 *   ]}
 *   data={users}
 *   keyExtractor={(row) => row.id}
 *   onSort={handleSort}
 *   sortBy={{ columnId: 'name', direction: 'asc' }}
 * />
 * ```
 */

import React, { useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import type { SortDirection, SelectionMode, KeyExtractor } from './types';

export interface Column<T> {
  /** Unique column identifier */
  id: string;
  /** Column header content */
  header: React.ReactNode;
  /** Key to access data or function to compute value */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Column width */
  width?: number | string;
  /** Minimum column width */
  minWidth?: number;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer */
  cell?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data rows */
  data: T[];
  /** Extract unique key from row */
  keyExtractor: KeyExtractor<T>;
  /** Callback when row is clicked */
  onRowClick?: (row: T) => void;
  /** Callback when sort changes */
  onSort?: (columnId: string, direction: SortDirection) => void;
  /** Current sort configuration */
  sortBy?: { columnId: string; direction: SortDirection };
  /** Set of selected row keys */
  selectedRows?: Set<string>;
  /** Callback when selection changes */
  onSelectionChange?: (selected: Set<string>) => void;
  /** Enable row selection */
  selectable?: SelectionMode;
  /** Make header sticky */
  stickyHeader?: boolean;
  /** Alternate row backgrounds */
  striped?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Message when no data */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

function SortIcon({ direction }: { direction?: SortDirection }) {
  if (!direction) {
    return (
      <svg
        className="w-4 h-4 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }

  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      {direction === 'asc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      )}
    </svg>
  );
}

function TableInner<T>(
  {
    columns,
    data,
    keyExtractor,
    onRowClick,
    onSort,
    sortBy,
    selectedRows,
    onSelectionChange,
    selectable,
    stickyHeader,
    striped,
    loading,
    emptyMessage = 'No data',
    className,
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const allSelected = useMemo(() => {
    if (!selectable || data.length === 0 || !selectedRows) return false;
    return data.every((row) => selectedRows.has(keyExtractor(row)));
  }, [selectable, data, selectedRows, keyExtractor]);

  const someSelected = useMemo(() => {
    if (!selectable || data.length === 0 || !selectedRows) return false;
    return data.some((row) => selectedRows.has(keyExtractor(row))) && !allSelected;
  }, [selectable, data, selectedRows, keyExtractor, allSelected]);

  const handleHeaderClick = useCallback(
    (column: Column<T>) => {
      if (!column.sortable || !onSort) return;
      const newDirection: SortDirection =
        sortBy?.columnId === column.id && sortBy.direction === 'asc' ? 'desc' : 'asc';
      onSort(column.id, newDirection);
    },
    [sortBy, onSort]
  );

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange || !selectable || selectable === 'single') return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row) => keyExtractor(row))));
    }
  }, [allSelected, data, keyExtractor, onSelectionChange, selectable]);

  const handleRowSelect = useCallback(
    (row: T, event: React.MouseEvent | React.ChangeEvent) => {
      event.stopPropagation();
      if (!onSelectionChange || !selectable) return;

      const key = keyExtractor(row);
      const newSelected = new Set(selectedRows);

      if (selectable === 'single') {
        if (newSelected.has(key)) {
          newSelected.clear();
        } else {
          newSelected.clear();
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
    },
    [keyExtractor, onSelectionChange, selectable, selectedRows]
  );

  const getCellValue = useCallback((row: T, column: Column<T>): React.ReactNode => {
    const value =
      typeof column.accessor === 'function'
        ? column.accessor(row)
        : row[column.accessor as keyof T];

    if (column.cell) {
      return column.cell(value, row);
    }

    return value as React.ReactNode;
  }, []);

  const getColumnStyle = useCallback((column: Column<T>): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (column.width) {
      style.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
    }
    if (column.minWidth) {
      style.minWidth = `${column.minWidth}px`;
    }
    return style;
  }, []);

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden',
        className
      )}
    >
      <div className="overflow-auto">
        <table className="w-full border-collapse" role="grid">
          <thead
            className={cn(
              'bg-white/5',
              stickyHeader && 'sticky top-0 z-10 backdrop-blur-xl'
            )}
          >
            <tr role="row">
              {selectable && selectable !== 'single' && (
                <th
                  className="w-12 px-4 py-3 text-left"
                  role="columnheader"
                  scope="col"
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 checked:bg-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {selectable === 'single' && (
                <th className="w-12 px-4 py-3" role="columnheader" scope="col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-sm font-semibold text-white/70 border-b border-white/10',
                    alignmentClass[column.align || 'left'],
                    column.sortable && 'cursor-pointer hover:text-white select-none'
                  )}
                  style={getColumnStyle(column)}
                  onClick={() => handleHeaderClick(column)}
                  role="columnheader"
                  scope="col"
                  aria-sort={
                    sortBy?.columnId === column.id
                      ? sortBy.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <div className={cn(
                    'flex items-center gap-2',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}>
                    {column.header}
                    {column.sortable && (
                      <SortIcon
                        direction={sortBy?.columnId === column.id ? sortBy.direction : undefined}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr role="row">
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-white/50"
                  role="gridcell"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-blue-500 rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr role="row">
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-white/50"
                  role="gridcell"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const key = keyExtractor(row);
                const isSelected = selectedRows?.has(key);

                return (
                  <tr
                    key={key}
                    className={cn(
                      'transition-colors',
                      striped && index % 2 === 1 && 'bg-white/[0.02]',
                      onRowClick && 'cursor-pointer hover:bg-white/5',
                      isSelected && 'bg-blue-500/10'
                    )}
                    onClick={() => onRowClick?.(row)}
                    role="row"
                    aria-selected={isSelected}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3" role="gridcell">
                        <input
                          type={selectable === 'single' ? 'radio' : 'checkbox'}
                          name={selectable === 'single' ? 'table-selection' : undefined}
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(row, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-white/30 bg-white/10 checked:bg-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0"
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'px-4 py-3 text-sm text-white/90 border-b border-white/5',
                          alignmentClass[column.align || 'left']
                        )}
                        style={getColumnStyle(column)}
                        role="gridcell"
                      >
                        {getCellValue(row, column)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Table = React.forwardRef(TableInner) as <T>(
  props: TableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

(Table as React.FC).displayName = 'Table';
