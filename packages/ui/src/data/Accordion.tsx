/**
 * Accordion Component
 *
 * Expandable sections with glass styling.
 *
 * @example
 * ```tsx
 * <Accordion defaultExpanded={['section-1']}>
 *   <AccordionItem id="section-1" title="General Settings">
 *     <p>Settings content here...</p>
 *   </AccordionItem>
 *   <AccordionItem id="section-2" title="Advanced">
 *     <p>Advanced options...</p>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */

import React, { createContext, useContext, useCallback, useState, useMemo, useId } from 'react';
import { cn } from '../lib/utils';

interface AccordionContextValue {
  expandedIds: Set<string>;
  toggleItem: (id: string) => void;
  multiple: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion');
  }
  return context;
}

export interface AccordionProps {
  /** Initially expanded item IDs */
  defaultExpanded?: string[];
  /** Controlled expanded IDs */
  expanded?: string[];
  /** Callback when expanded items change */
  onExpandedChange?: (expanded: string[]) => void;
  /** Allow multiple items expanded at once */
  multiple?: boolean;
  /** Accordion items */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export interface AccordionItemProps {
  /** Unique item identifier */
  id: string;
  /** Header title */
  title: React.ReactNode;
  /** Icon to display before title */
  icon?: React.ReactNode;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Content when expanded */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn(
        'w-4 h-4 transition-transform duration-200',
        expanded && 'rotate-180'
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ id, title, icon, disabled, children, className }, ref) => {
    const { expandedIds, toggleItem } = useAccordionContext();
    const isExpanded = expandedIds.has(id);
    const contentId = useId();
    const headerId = useId();

    const handleToggle = useCallback(() => {
      if (!disabled) {
        toggleItem(id);
      }
    }, [disabled, id, toggleItem]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleItem(id);
        }
      },
      [disabled, id, toggleItem]
    );

    return (
      <div
        ref={ref}
        className={cn('border-b border-white/10 last:border-b-0', className)}
      >
        <button
          id={headerId}
          type="button"
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/50',
            !disabled && 'hover:bg-white/5',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-expanded={isExpanded}
          aria-controls={contentId}
        >
          {icon && <div className="flex-shrink-0 text-white/60">{icon}</div>}
          <span className="flex-1 text-sm font-medium text-white">{title}</span>
          <ChevronIcon expanded={isExpanded} />
        </button>

        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-4 pb-4 pt-1 text-sm text-white/70">{children}</div>
        </div>
      </div>
    );
  }
);

AccordionItem.displayName = 'AccordionItem';

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      defaultExpanded = [],
      expanded: controlledExpanded,
      onExpandedChange,
      multiple = false,
      children,
      className,
    },
    ref
  ) => {
    const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
      () => new Set(defaultExpanded)
    );

    const expandedIds = useMemo(
      () => (controlledExpanded ? new Set(controlledExpanded) : internalExpanded),
      [controlledExpanded, internalExpanded]
    );

    const toggleItem = useCallback(
      (id: string) => {
        const update = (prev: Set<string>) => {
          const next = new Set(prev);
          if (next.has(id)) {
            next.delete(id);
          } else {
            if (!multiple) {
              next.clear();
            }
            next.add(id);
          }
          return next;
        };

        if (controlledExpanded !== undefined) {
          const next = update(expandedIds);
          onExpandedChange?.(Array.from(next));
        } else {
          setInternalExpanded((prev) => {
            const next = update(prev);
            onExpandedChange?.(Array.from(next));
            return next;
          });
        }
      },
      [controlledExpanded, expandedIds, multiple, onExpandedChange]
    );

    const contextValue = useMemo(
      () => ({ expandedIds, toggleItem, multiple }),
      [expandedIds, toggleItem, multiple]
    );

    return (
      <AccordionContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden',
            className
          )}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

Accordion.displayName = 'Accordion';
