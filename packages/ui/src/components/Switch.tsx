/**
 * Switch/Toggle Component
 *
 * macOS-style toggle switch.
 *
 * @example
 * ```tsx
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';

export interface SwitchProps {
  /** Whether the switch is on */
  checked?: boolean;
  /** Callback when switch is toggled */
  onCheckedChange?: (checked: boolean) => void;
  /** Disable the switch */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, className, size = 'md' }, ref) => {
    const sizes = sizeClasses[size];

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'relative rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50',
          sizes.track,
          checked ? 'bg-green-500' : 'bg-white/20',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform',
            sizes.thumb,
            checked && sizes.translate
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';
