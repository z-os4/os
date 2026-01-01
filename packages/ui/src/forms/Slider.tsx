/**
 * Slider Component (Forms version)
 *
 * A range slider with marks, labels, and glass styling.
 *
 * @example
 * ```tsx
 * <Slider
 *   value={volume}
 *   onChange={setVolume}
 *   min={0}
 *   max={100}
 *   label="Volume"
 *   showValue
 *   marks={[
 *     { value: 0, label: '0%' },
 *     { value: 50, label: '50%' },
 *     { value: 100, label: '100%' },
 *   ]}
 * />
 * ```
 */

import React, { useId, forwardRef, useMemo, useCallback } from 'react';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, type FormSize } from './types';

export interface SliderMark {
  /** Value at which to place the mark */
  value: number;
  /** Optional label to display */
  label?: string;
}

export interface FormSliderProps {
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Field label */
  label?: string;
  /** Show current value */
  showValue?: boolean;
  /** Format function for displayed value */
  formatValue?: (value: number) => string;
  /** Marks to display on the track */
  marks?: SliderMark[];
  /** Whether to snap to marks only */
  snapToMarks?: boolean;
  /** Whether slider is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Size variant */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
}

export const FormSlider = forwardRef<HTMLInputElement, FormSliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      label,
      showValue = false,
      formatValue = (v) => String(v),
      marks,
      snapToMarks = false,
      disabled = false,
      error,
      hint,
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

    // Calculate percentage for styling
    const percentage = useMemo(() => {
      return ((value - min) / (max - min)) * 100;
    }, [value, min, max]);

    // Handle value change, optionally snapping to marks
    const handleChange = useCallback(
      (newValue: number) => {
        if (snapToMarks && marks && marks.length > 0) {
          // Find the closest mark
          let closest = marks[0].value;
          let minDist = Math.abs(newValue - closest);
          for (const mark of marks) {
            const dist = Math.abs(newValue - mark.value);
            if (dist < minDist) {
              minDist = dist;
              closest = mark.value;
            }
          }
          onChange(closest);
        } else {
          onChange(newValue);
        }
      },
      [snapToMarks, marks, onChange]
    );

    // Track heights based on size
    const trackHeight = size === 'sm' ? 'h-1' : size === 'md' ? 'h-1.5' : 'h-2';
    const thumbSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

    return (
      <div className={cn('w-full', className)}>
        {/* Label row */}
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label htmlFor={id} className={cn('font-medium text-white/90', sizeClasses.label, 'mb-0')}>
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm text-white/70 tabular-nums">{formatValue(value)}</span>
            )}
          </div>
        )}

        {/* Slider track container */}
        <div className="relative pt-2 pb-6">
          {/* Track background */}
          <div
            className={cn(
              'absolute inset-x-0 rounded-full bg-white/20',
              trackHeight,
              'top-1/2 -translate-y-1/2'
            )}
          />

          {/* Filled track */}
          <div
            className={cn(
              'absolute left-0 rounded-full',
              trackHeight,
              'top-1/2 -translate-y-1/2',
              disabled ? 'bg-white/30' : 'bg-blue-500'
            )}
            style={{ width: `${percentage}%` }}
          />

          {/* Marks */}
          {marks && marks.length > 0 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
              {marks.map((mark) => {
                const markPercentage = ((mark.value - min) / (max - min)) * 100;
                const isActive = mark.value <= value;
                return (
                  <div
                    key={mark.value}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${markPercentage}%` }}
                  >
                    {/* Mark dot */}
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full border-2 transition-colors',
                        isActive
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white/30 border-white/30'
                      )}
                    />
                    {/* Mark label */}
                    {mark.label && (
                      <span
                        className={cn(
                          'absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap',
                          'text-xs text-white/50'
                        )}
                      >
                        {mark.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Range input (invisible but interactive) */}
          <input
            ref={ref}
            id={id}
            type="range"
            name={name}
            min={min}
            max={max}
            step={snapToMarks ? 'any' : step}
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={cn(error && errorId, hint && !error && hintId) || undefined}
            className={cn(
              'absolute inset-0 w-full opacity-0 cursor-pointer',
              disabled && 'cursor-not-allowed'
            )}
            style={{ height: thumbSize }}
          />

          {/* Visual thumb */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full shadow-md pointer-events-none transition-transform',
              'bg-white',
              disabled && 'bg-white/70',
              !disabled && 'hover:scale-110'
            )}
            style={{
              left: `calc(${percentage}% - ${thumbSize / 2}px)`,
              width: thumbSize,
              height: thumbSize,
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p id={hintId} className="mt-1 text-xs text-white/50">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormSlider.displayName = 'FormSlider';
