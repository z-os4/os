/**
 * Command Palette Component
 *
 * Spotlight-style command palette with search, categories, and keyboard navigation.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Search, Calculator, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCommandPalette } from './useCommandPalette';
import { CommandPaletteItem } from './CommandPaletteItem';
import {
  searchCommands,
  groupResultsByCategory,
  evaluateMathExpression,
} from './fuzzySearch';
import type { PaletteCommand as Command, CommandPaletteProps, CommandSearchResult } from './types';

// Category display order
const CATEGORY_ORDER = [
  'Recent',
  'Apps',
  'Actions',
  'Files',
  'Folders',
  'Commands',
  'Settings',
  'URLs',
  'Calculations',
];

/**
 * Command Palette
 *
 * A Spotlight-style command palette with:
 * - Instant fuzzy search filtering
 * - Categorized results
 * - Recent items section
 * - Full keyboard navigation
 * - Glass effect styling
 */
export function CommandPalette({
  className,
  placeholder = 'Search commands, apps, files...',
  emptyMessage = 'No results found',
  maxHeight = 480,
}: CommandPaletteProps) {
  const {
    state,
    commands,
    close,
    setQuery,
    setSelectedIndex,
    executeCommand,
  } = useCommandPalette();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [isClosing, setIsClosing] = useState(false);

  // Focus input when opened
  useEffect(() => {
    if (state.isOpen) {
      setIsClosing(false);
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [state.isOpen]);

  // Handle close animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      close();
      setIsClosing(false);
    }, 150);
  }, [close]);

  // Search results with calculation support
  const { results, calculationResult } = useMemo(() => {
    const query = state.query.trim();

    // Check for math expression
    const calcResult = evaluateMathExpression(query);

    // Get search results
    let searchResults = searchCommands(commands, query);

    // Add recent items to top if no query
    if (!query && state.recentIds.length > 0) {
      const recentCommands = state.recentIds
        .map((id) => commands.find((c) => c.id === id))
        .filter((c): c is Command => c !== undefined)
        .map((command) => ({
          command: { ...command, category: 'Recent' as const },
          score: 1,
          matches: [],
        }));

      // Remove duplicates from main results
      const recentIdSet = new Set(state.recentIds);
      searchResults = searchResults.filter(
        (r) => !recentIdSet.has(r.command.id)
      );

      searchResults = [...recentCommands, ...searchResults];
    }

    return {
      results: searchResults,
      calculationResult: calcResult,
    };
  }, [commands, state.query, state.recentIds]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups = groupResultsByCategory(results);
    const orderedGroups: Array<{
      category: string;
      items: CommandSearchResult[];
    }> = [];

    for (const category of CATEGORY_ORDER) {
      const items = groups.get(category);
      if (items && items.length > 0) {
        orderedGroups.push({ category, items });
      }
    }

    // Add any remaining categories
    for (const [category, items] of groups) {
      if (!CATEGORY_ORDER.includes(category) && items.length > 0) {
        orderedGroups.push({ category, items });
      }
    }

    return orderedGroups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: CommandSearchResult[] = [];
    for (const group of groupedResults) {
      flat.push(...group.items);
    }
    return flat;
  }, [groupedResults]);

  // Total count including calculation result
  const totalCount = flatResults.length + (calculationResult ? 1 : 0);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(
            state.selectedIndex < totalCount - 1 ? state.selectedIndex + 1 : 0
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(
            state.selectedIndex > 0 ? state.selectedIndex - 1 : totalCount - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (calculationResult && state.selectedIndex === 0) {
            // Copy calculation result
            navigator.clipboard?.writeText(calculationResult);
            handleClose();
          } else {
            const adjustedIndex = calculationResult
              ? state.selectedIndex - 1
              : state.selectedIndex;
            const result = flatResults[adjustedIndex];
            if (result && !result.command.disabled) {
              executeCommand(result.command);
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          handleClose();
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            setSelectedIndex(
              state.selectedIndex > 0 ? state.selectedIndex - 1 : totalCount - 1
            );
          } else {
            setSelectedIndex(
              state.selectedIndex < totalCount - 1 ? state.selectedIndex + 1 : 0
            );
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.isOpen,
    state.selectedIndex,
    totalCount,
    flatResults,
    calculationResult,
    setSelectedIndex,
    executeCommand,
    handleClose,
  ]);

  // Scroll selected item into view
  useEffect(() => {
    const item = itemRefs.current.get(state.selectedIndex);
    if (item && listRef.current) {
      item.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [state.selectedIndex]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery]
  );

  // Handle item click
  const handleItemClick = useCallback(
    (result: CommandSearchResult) => {
      if (!result.command.disabled) {
        executeCommand(result.command);
      }
    },
    [executeCommand]
  );

  // Handle calculation click
  const handleCalculationClick = useCallback(() => {
    if (calculationResult) {
      navigator.clipboard?.writeText(calculationResult);
      handleClose();
    }
  }, [calculationResult, handleClose]);

  if (!state.isOpen && !isClosing) return null;

  let itemIndex = 0;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]',
        'transition-all duration-150',
        isClosing ? 'bg-black/0' : 'bg-black/40',
        'backdrop-blur-[2px]',
        className
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Main panel */}
      <div
        className={cn(
          'w-full max-w-[640px] mx-4',
          'bg-neutral-900/90 backdrop-blur-xl',
          'rounded-2xl overflow-hidden',
          'border border-white/10',
          'shadow-2xl shadow-black/50',
          'transition-all duration-150',
          isClosing
            ? 'opacity-0 scale-95 translate-y-4'
            : 'opacity-100 scale-100 translate-y-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search className="w-5 h-5 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={state.query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              'flex-1 bg-transparent text-white text-base',
              'placeholder-white/30',
              'outline-none border-none',
              'selection:bg-blue-500/40'
            )}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {/* Keyboard hints */}
          <div className="flex items-center gap-1.5 text-white/30">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded border border-white/10">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="overflow-y-auto overscroll-contain"
          style={{ maxHeight }}
          role="listbox"
        >
          {/* Calculation result */}
          {calculationResult && (
            <div className="py-2">
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                  Calculator
                </span>
              </div>
              <div
                ref={(el) => {
                  if (el) itemRefs.current.set(0, el);
                }}
                role="option"
                aria-selected={state.selectedIndex === 0}
                onClick={handleCalculationClick}
                onMouseEnter={() => setSelectedIndex(0)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer',
                  'transition-colors duration-75',
                  state.selectedIndex === 0
                    ? 'bg-blue-500/20 text-white'
                    : 'text-white/80 hover:bg-white/5'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
                    'bg-orange-500/20',
                    state.selectedIndex === 0 && 'bg-orange-500/30'
                  )}
                >
                  <Calculator className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-medium tabular-nums">
                    {calculationResult}
                  </div>
                  <div className="text-xs text-white/40">
                    = {state.query} (click to copy)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grouped results */}
          {groupedResults.map((group) => (
            <div key={group.category} className="py-2">
              {/* Category header */}
              <div className="px-4 py-1.5 flex items-center gap-2">
                {group.category === 'Recent' && (
                  <Clock className="w-3 h-3 text-white/30" />
                )}
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                  {group.category}
                </span>
              </div>

              {/* Items */}
              {group.items.map((result) => {
                const currentIndex = calculationResult
                  ? itemIndex + 1
                  : itemIndex;
                const isSelected = state.selectedIndex === currentIndex;
                itemIndex++;

                return (
                  <CommandPaletteItem
                    key={result.command.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(currentIndex, el);
                    }}
                    command={result.command}
                    isSelected={isSelected}
                    matches={result.matches}
                    onClick={() => handleItemClick(result)}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  />
                );
              })}
            </div>
          ))}

          {/* Empty state */}
          {totalCount === 0 && (
            <div className="py-12 text-center">
              <div className="text-white/40 text-sm">{emptyMessage}</div>
              <div className="text-white/20 text-xs mt-1">
                Try a different search term
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-neutral-900/50">
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">
                \u2191
              </kbd>
              <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">
                \u2193
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">
                \u21B5
              </kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">
                esc
              </kbd>
              close
            </span>
          </div>
          <div className="text-[10px] text-white/30">
            {totalCount} result{totalCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
