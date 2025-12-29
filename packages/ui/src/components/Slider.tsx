/**
 * Slider Component
 *
 * macOS-style range slider.
 *
 * @example
 * ```tsx
 * <Slider value={volume} onChange={setVolume} min={0} max={100} />
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';

export interface SliderProps {
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Disable the slider */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Show value label */
  showValue?: boolean;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      className,
      showValue = false,
    },
    ref
  ) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="relative flex-1 h-6 flex items-center">
          {/* Track background */}
          <div className="absolute inset-0 h-1 bg-white/20 rounded-full my-auto" />

          {/* Filled track */}
          <div
            className="absolute h-1 bg-blue-500 rounded-full my-auto"
            style={{ width: `${percentage}%` }}
          />

          {/* Input */}
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(
              'absolute inset-0 w-full opacity-0 cursor-pointer',
              disabled && 'cursor-not-allowed'
            )}
            style={{
              WebkitAppearance: 'none',
            }}
          />

          {/* Thumb */}
          <div
            className={cn(
              'absolute w-4 h-4 bg-white rounded-full shadow-md pointer-events-none transition-transform',
              !disabled && 'hover:scale-110'
            )}
            style={{ left: `calc(${percentage}% - 8px)` }}
          />
        </div>

        {showValue && (
          <span className="text-sm text-white/70 tabular-nums w-10 text-right">
            {value}
          </span>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';
