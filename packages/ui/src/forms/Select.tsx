/**
 * Select Component
 *
 * A dropdown select with search, groups, and multi-select support.
 * Uses glass styling with smooth animations.
 *
 * @example
 * ```tsx
 * <Select
 *   value={country}
 *   onChange={setCountry}
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *   ]}
 *   label="Country"
 *   searchable
 * />
 * ```
 */

import React, {
  useId,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, GLASS_STYLES, type FormSize, type SelectOption } from './types';

export type { SelectOption };

export interface SelectProps<T = string> {
  /** Current value (single or array for multiple) */
  value: T | T[];
  /** Change handler */
  onChange: (value: T | T[]) => void;
  /** Available options */
  options: SelectOption<T>[];
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Hint/helper text */
  hint?: string;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Enable search/filter */
  searchable?: boolean;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Field size */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
}

// Chevron icon
const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Check icon
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// X icon for clearing
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function SelectInner<T = string>(
  {
    value,
    onChange,
    options,
    label,
    placeholder = 'Select...',
    error,
    hint,
    disabled = false,
    required = false,
    searchable = false,
    multiple = false,
    size = 'md',
    className,
    name,
  }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const listboxId = `${id}-listbox`;
  const sizeClasses = SIZE_CLASSES[size];

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array for internal use
  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value !== undefined && value !== null ? [value] : [];
  }, [value, multiple]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(searchLower));
  }, [options, search]);

  // Group options by group property
  const groupedOptions = useMemo(() => {
    const groups: Record<string, SelectOption<T>[]> = {};
    const ungrouped: SelectOption<T>[] = [];

    filteredOptions.forEach((opt) => {
      if (opt.group) {
        if (!groups[opt.group]) groups[opt.group] = [];
        groups[opt.group].push(opt);
      } else {
        ungrouped.push(opt);
      }
    });

    return { groups, ungrouped };
  }, [filteredOptions]);

  // Flat list for keyboard navigation
  const flatOptions = useMemo(() => {
    const flat: SelectOption<T>[] = [];
    groupedOptions.ungrouped.forEach((opt) => flat.push(opt));
    Object.values(groupedOptions.groups).forEach((group) => {
      group.forEach((opt) => flat.push(opt));
    });
    return flat;
  }, [groupedOptions]);

  // Get display text
  const displayText = useMemo(() => {
    if (selectedValues.length === 0) return null;
    if (multiple && selectedValues.length > 1) {
      return `${selectedValues.length} selected`;
    }
    const selectedOption = options.find((opt) => opt.value === selectedValues[0]);
    return selectedOption?.label ?? null;
  }, [selectedValues, options, multiple]);

  // Handle option selection
  const handleSelect = useCallback(
    (optionValue: T) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter((v) => v !== optionValue)
          : [...currentValues, optionValue];
        onChange(newValues);
      } else {
        onChange(optionValue as T & T[]);
        setIsOpen(false);
      }
      setSearch('');
    },
    [multiple, value, onChange]
  );

  // Handle clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(multiple ? ([] as T & T[]) : (undefined as unknown as T & T[]));
    },
    [multiple, onChange]
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset focused index when options change
  useEffect(() => {
    setFocusedIndex(0);
  }, [filteredOptions]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && flatOptions[focusedIndex]) {
            handleSelect(flatOptions[focusedIndex].value);
          } else {
            setIsOpen(true);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearch('');
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex((prev) => Math.min(prev + 1, flatOptions.length - 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) => Math.max(prev - 1, 0));
          }
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            setFocusedIndex(0);
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            setFocusedIndex(flatOptions.length - 1);
          }
          break;
      }
    },
    [disabled, isOpen, flatOptions, focusedIndex, handleSelect]
  );

  const isSelected = (optionValue: T) => selectedValues.some((v) => v === optionValue);

  return (
    <div ref={containerRef} className={cn('w-full relative', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block font-medium text-white/90',
            sizeClasses.label,
            required && "after:content-['*'] after:ml-0.5 after:text-red-400"
          )}
        >
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        ref={ref}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-invalid={!!error}
        aria-describedby={cn(error && errorId, hint && !error && hintId) || undefined}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between rounded-lg transition-all duration-200',
          'text-left',
          GLASS_STYLES.base,
          GLASS_STYLES.focus,
          sizeClasses.input,
          error && GLASS_STYLES.error,
          disabled && GLASS_STYLES.disabled
        )}
      >
        <span className={cn(displayText ? 'text-white' : 'text-white/40')}>
          {displayText ?? placeholder}
        </span>

        <div className="flex items-center gap-1">
          {/* Clear button */}
          {selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-white/10 rounded transition-colors"
              aria-label="Clear selection"
            >
              <XIcon className={cn(sizeClasses.icon, 'text-white/40')} />
            </button>
          )}

          {/* Chevron */}
          <ChevronIcon
            className={cn(
              sizeClasses.icon,
              'text-white/40 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={multiple ? JSON.stringify(value) : String(value ?? '')}
        />
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 w-full mt-1 rounded-lg overflow-hidden',
              GLASS_STYLES.base,
              'shadow-lg shadow-black/20'
            )}
          >
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-white/10">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className={cn(
                    'w-full px-2 py-1.5 rounded bg-white/5 text-white text-sm',
                    'placeholder-white/40 border border-white/10',
                    'focus:outline-none focus:border-white/30'
                  )}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            {/* Options list */}
            <ul
              id={listboxId}
              role="listbox"
              aria-multiselectable={multiple}
              className="max-h-60 overflow-y-auto py-1"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-white/50 text-center">No options found</li>
              ) : (
                <>
                  {/* Ungrouped options */}
                  {groupedOptions.ungrouped.map((option, index) => (
                    <Option
                      key={String(option.value)}
                      option={option}
                      isSelected={isSelected(option.value)}
                      isFocused={flatOptions[focusedIndex]?.value === option.value}
                      onSelect={() => handleSelect(option.value)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      size={size}
                      multiple={multiple}
                    />
                  ))}

                  {/* Grouped options */}
                  {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                    <li key={groupName} role="group" aria-label={groupName}>
                      <div className="px-3 py-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">
                        {groupName}
                      </div>
                      <ul>
                        {groupOptions.map((option) => {
                          const idx = flatOptions.findIndex((o) => o.value === option.value);
                          return (
                            <Option
                              key={String(option.value)}
                              option={option}
                              isSelected={isSelected(option.value)}
                              isFocused={flatOptions[focusedIndex]?.value === option.value}
                              onSelect={() => handleSelect(option.value)}
                              onMouseEnter={() => setFocusedIndex(idx)}
                              size={size}
                              multiple={multiple}
                            />
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-white/50">
          {hint}
        </p>
      )}
    </div>
  );
}

// Option component
interface OptionProps<T> {
  option: SelectOption<T>;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  size: FormSize;
  multiple: boolean;
}

function Option<T>({
  option,
  isSelected,
  isFocused,
  onSelect,
  onMouseEnter,
  size,
  multiple,
}: OptionProps<T>) {
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      onClick={() => !option.disabled && onSelect()}
      onMouseEnter={onMouseEnter}
      className={cn(
        'px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors',
        'text-sm text-white',
        isFocused && 'bg-white/10',
        isSelected && !multiple && 'bg-blue-500/20',
        option.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Checkbox for multiple select */}
      {multiple && (
        <div
          className={cn(
            'w-4 h-4 rounded border flex items-center justify-center',
            'transition-colors',
            isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/30 bg-transparent'
          )}
        >
          {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
      )}

      <span className="flex-1">{option.label}</span>

      {/* Check for single select */}
      {!multiple && isSelected && (
        <CheckIcon className={cn(sizeClasses.icon, 'text-blue-400')} />
      )}
    </li>
  );
}

// Export with forwardRef
export const Select = forwardRef(SelectInner) as <T = string>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => React.ReactElement;
