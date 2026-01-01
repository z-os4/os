/**
 * DatePicker Component
 *
 * Date selection with calendar popup and glass styling.
 *
 * @example
 * ```tsx
 * <DatePicker
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   label="Date of birth"
 *   placeholder="Select a date"
 * />
 * ```
 */

import React, { useId, forwardRef, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, GLASS_STYLES, type FormSize } from './types';

export interface DatePickerProps {
  /** Selected date */
  value: Date | undefined;
  /** Change handler */
  onChange: (date: Date | undefined) => void;
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Date format for display */
  format?: 'short' | 'medium' | 'long';
  /** Size variant */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
}

// Icons
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Format date for display
function formatDate(date: Date, format: 'short' | 'medium' | 'long'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    case 'medium':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'long':
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

// Check if two dates are the same day
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Get days in a month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get the first day of the month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder = 'Select date',
      error,
      hint,
      disabled = false,
      required = false,
      minDate,
      maxDate,
      format = 'medium',
      size = 'md',
      className,
      name,
    },
    ref
  ) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const sizeClasses = SIZE_CLASSES[size];

    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => value ?? new Date());

    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Update view when value changes
    useEffect(() => {
      if (value) {
        setViewDate(value);
      }
    }, [value]);

    // Calendar grid data
    const calendarDays = useMemo(() => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);

      const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

      // Previous month days
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
          date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
          isCurrentMonth: false,
        });
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          date: new Date(year, month, i),
          isCurrentMonth: true,
        });
      }

      // Next month days to fill the grid
      const remaining = 42 - days.length; // 6 rows * 7 days
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;

      for (let i = 1; i <= remaining; i++) {
        days.push({
          date: new Date(nextYear, nextMonth, i),
          isCurrentMonth: false,
        });
      }

      return days;
    }, [viewDate]);

    // Check if a date is disabled
    const isDateDisabled = useCallback(
      (date: Date): boolean => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
      },
      [minDate, maxDate]
    );

    // Navigation handlers
    const goToPrevMonth = () => {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const goToToday = () => {
      const today = new Date();
      setViewDate(today);
      if (!isDateDisabled(today)) {
        onChange(today);
        setIsOpen(false);
      }
    };

    // Select date handler
    const handleSelectDate = (date: Date) => {
      if (isDateDisabled(date)) return;
      onChange(date);
      setIsOpen(false);
    };

    // Clear handler
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
    };

    const today = new Date();

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
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, hint && !error && hintId) || undefined}
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
          <span className={cn(value ? 'text-white' : 'text-white/40')}>
            {value ? formatDate(value, format) : placeholder}
          </span>

          <div className="flex items-center gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-white/10 rounded transition-colors"
                aria-label="Clear date"
              >
                <svg
                  className={cn(sizeClasses.icon, 'text-white/40')}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <CalendarIcon className={cn(sizeClasses.icon, 'text-white/40')} />
          </div>
        </button>

        {/* Hidden input for form submission */}
        {name && (
          <input type="hidden" name={name} value={value?.toISOString() ?? ''} />
        )}

        {/* Calendar popup */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              role="dialog"
              aria-label="Date picker calendar"
              className={cn(
                'absolute z-50 mt-1 p-4 rounded-lg',
                GLASS_STYLES.base,
                'shadow-lg shadow-black/20'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-white/70" />
                </button>

                <span className="text-sm font-medium text-white">
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRightIcon className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="w-8 h-8 flex items-center justify-center text-xs text-white/50">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                  const isSelected = value && isSameDay(date, value);
                  const isToday = isSameDay(date, today);
                  const isDisabled = isDateDisabled(date);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      disabled={isDisabled}
                      className={cn(
                        'w-8 h-8 rounded text-sm transition-colors',
                        'flex items-center justify-center',
                        !isCurrentMonth && 'text-white/30',
                        isCurrentMonth && !isSelected && !isDisabled && 'text-white hover:bg-white/10',
                        isSelected && 'bg-blue-500 text-white',
                        isToday && !isSelected && 'ring-1 ring-blue-500',
                        isDisabled && 'text-white/20 cursor-not-allowed'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between">
                <button
                  type="button"
                  onClick={goToToday}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-white/50 hover:text-white/70 transition-colors"
                >
                  Close
                </button>
              </div>
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
);

DatePicker.displayName = 'DatePicker';
