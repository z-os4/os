/**
 * SearchInput Component for zOS
 *
 * Debounced search input with recent searches and loading state
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  type KeyboardEvent,
  type ChangeEvent,
  type FocusEvent,
} from 'react';
import type { SearchInputProps, RecentSearch } from './types';

/**
 * Default storage key for recent searches
 */
const DEFAULT_STORAGE_KEY = 'zos-recent-searches';

/**
 * Maximum recent searches to display
 */
const DEFAULT_MAX_RECENT = 5;

/**
 * Load recent searches from storage
 */
function loadRecentSearches(key: string, max: number): RecentSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const searches = JSON.parse(data) as RecentSearch[];
    return searches.slice(0, max);
  } catch {
    return [];
  }
}

/**
 * Save recent search to storage
 */
function saveRecentSearch(key: string, query: string, max: number): void {
  if (typeof window === 'undefined') return;
  if (!query.trim()) return;

  try {
    const existing = loadRecentSearches(key, max);

    // Remove duplicate if exists
    const filtered = existing.filter(
      (s) => s.query.toLowerCase() !== query.toLowerCase()
    );

    // Add new search at the beginning
    const updated: RecentSearch[] = [
      { query: query.trim(), timestamp: Date.now() },
      ...filtered,
    ].slice(0, max);

    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear recent searches from storage
 */
function clearRecentSearches(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

/**
 * Custom hook for debouncing string values
 */
function useDebouncedStringCallback(
  callback: (value: string) => void,
  delay: number
): (value: string) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(value);
      }, delay);
    },
    [delay]
  );
}

/**
 * SearchInput component with debouncing, recent searches, and loading state
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="Search notes..."
 *   showRecent
 *   isLoading={isSearching}
 * />
 * ```
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(props, ref) {
    const {
      value,
      onChange,
      placeholder = 'Search...',
      showRecent = false,
      maxRecent = DEFAULT_MAX_RECENT,
      storageKey = DEFAULT_STORAGE_KEY,
      debounce = 0,
      isLoading = false,
      disabled = false,
      autoFocus = false,
      className = '',
      onClear,
      onFocus,
      onBlur,
      onSubmit,
    } = props;

    const [isFocused, setIsFocused] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Sync local value with prop
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Load recent searches
    useEffect(() => {
      if (showRecent) {
        setRecentSearches(loadRecentSearches(storageKey, maxRecent));
      }
    }, [showRecent, storageKey, maxRecent]);

    // Debounced onChange handler
    const debouncedOnChange = useDebouncedStringCallback(
      (newValue: string) => {
        onChange(newValue);
      },
      debounce
    );

    // Handle input change
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (debounce > 0) {
          debouncedOnChange(newValue);
        } else {
          onChange(newValue);
        }
      },
      [onChange, debounce, debouncedOnChange]
    );

    // Handle focus
    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (showRecent && recentSearches.length > 0) {
          setShowDropdown(true);
        }
        onFocus?.();
      },
      [showRecent, recentSearches.length, onFocus]
    );

    // Handle blur
    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        // Delay hiding dropdown to allow click events
        setTimeout(() => {
          setIsFocused(false);
          setShowDropdown(false);
        }, 150);
        onBlur?.();
      },
      [onBlur]
    );

    // Handle keyboard events
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (localValue.trim()) {
            saveRecentSearch(storageKey, localValue, maxRecent);
            setRecentSearches(loadRecentSearches(storageKey, maxRecent));
          }
          setShowDropdown(false);
          onSubmit?.(localValue);
        } else if (e.key === 'Escape') {
          setShowDropdown(false);
          inputRef.current?.blur();
        }
      },
      [localValue, storageKey, maxRecent, onSubmit]
    );

    // Handle clear
    const handleClear = useCallback(() => {
      setLocalValue('');
      onChange('');
      onClear?.();
      inputRef.current?.focus();
    }, [onChange, onClear]);

    // Handle recent search click
    const handleRecentClick = useCallback(
      (query: string) => {
        setLocalValue(query);
        onChange(query);
        setShowDropdown(false);
      },
      [onChange]
    );

    // Handle clear recent searches
    const handleClearRecent = useCallback(() => {
      clearRecentSearches(storageKey);
      setRecentSearches([]);
    }, [storageKey]);

    // Combine refs
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const hasValue = localValue.length > 0;

    return (
      <div
        className={`zos-search-input ${className}`}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Search icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            position: 'absolute',
            left: '12px',
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        >
          <path
            d="M7 12c2.76 0 5-2.24 5-5S9.76 2 7 2 2 4.24 2 7s2.24 5 5 5zm4.5 1l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Input field */}
        <input
          ref={setRefs}
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            width: '100%',
            padding: '8px 36px',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: isFocused ? '#007AFF' : '#e0e0e0',
            outline: 'none',
            fontSize: '14px',
            lineHeight: '20px',
            backgroundColor: disabled ? '#f5f5f5' : '#fff',
            color: disabled ? '#999' : '#333',
            transition: 'border-color 0.15s ease',
          }}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              right: hasValue ? '36px' : '12px',
              width: '16px',
              height: '16px',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{
                animation: 'zos-spin 1s linear infinite',
              }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="28"
                strokeDashoffset="10"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>
        )}

        {/* Clear button */}
        {hasValue && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '8px',
              padding: '4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              opacity: 0.5,
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 3l8 8M11 3l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {/* Recent searches dropdown */}
        {showDropdown && showRecent && recentSearches.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid #f0f0f0',
                fontSize: '12px',
                color: '#666',
              }}
            >
              <span>Recent Searches</span>
              <button
                type="button"
                onClick={handleClearRecent}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#007AFF',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Clear
              </button>
            </div>
            {recentSearches.map((search, index) => (
              <button
                key={`${search.query}-${search.timestamp}`}
                type="button"
                onClick={() => handleRecentClick(search.query)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f5f5f5')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                {search.query}
              </button>
            ))}
          </div>
        )}

        {/* CSS keyframes for spinner */}
        <style>{`
          @keyframes zos-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
);

/**
 * Minimal search input without recent searches dropdown
 */
export function SearchInputMinimal({
  value,
  onChange,
  placeholder = 'Search...',
  debounce = 0,
  isLoading = false,
  disabled = false,
  className = '',
}: Pick<
  SearchInputProps,
  'value' | 'onChange' | 'placeholder' | 'debounce' | 'isLoading' | 'disabled' | 'className'
>) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useDebouncedStringCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    debounce
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (debounce > 0) {
        debouncedOnChange(newValue);
      } else {
        onChange(newValue);
      }
    },
    [onChange, debounce, debouncedOnChange]
  );

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
    />
  );
}

export type { SearchInputProps, RecentSearch };
