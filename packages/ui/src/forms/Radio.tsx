/**
 * Radio Component
 *
 * A polished radio button with glass styling.
 *
 * @example
 * ```tsx
 * <Radio
 *   checked={option === 'a'}
 *   onChange={() => setOption('a')}
 *   label="Option A"
 *   name="options"
 *   value="a"
 * />
 * ```
 */

import React, { useId, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { type FormSize } from './types';

export interface RadioProps {
  /** Whether the radio is checked */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Radio label */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Whether radio is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Name attribute (for grouping) */
  name?: string;
  /** Value attribute */
  value?: string;
}

const sizeConfig = {
  sm: { box: 'w-4 h-4', dot: 'w-2 h-2', text: 'text-xs', gap: 'gap-2' },
  md: { box: 'w-5 h-5', dot: 'w-2.5 h-2.5', text: 'text-sm', gap: 'gap-2.5' },
  lg: { box: 'w-6 h-6', dot: 'w-3 h-3', text: 'text-base', gap: 'gap-3' },
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked,
      onChange,
      label,
      description,
      disabled = false,
      size = 'md',
      className,
      name,
      value,
    },
    ref
  ) => {
    const id = useId();
    const sizes = sizeConfig[size];

    return (
      <label
        htmlFor={id}
        className={cn(
          'flex items-start cursor-pointer group',
          sizes.gap,
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {/* Radio circle */}
        <div className="relative flex-shrink-0 mt-0.5">
          {/* Hidden input */}
          <input
            ref={ref}
            id={id}
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />

          {/* Visual radio */}
          <div
            className={cn(
              'rounded-full border-2 transition-all duration-200',
              'flex items-center justify-center',
              sizes.box,
              checked
                ? 'border-blue-500'
                : 'border-white/30 group-hover:border-white/50',
              'peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-focus:ring-offset-2 peer-focus:ring-offset-transparent'
            )}
          >
            {/* Inner dot */}
            {checked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={cn('rounded-full bg-blue-500', sizes.dot)}
              />
            )}
          </div>
        </div>

        {/* Label and description */}
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && <span className={cn('text-white', sizes.text)}>{label}</span>}
            {description && (
              <p className={cn('text-white/50 mt-0.5', sizes.text === 'text-base' ? 'text-sm' : 'text-xs')}>
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
