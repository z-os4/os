/**
 * Input Component
 *
 * macOS-style input field with variants.
 *
 * @example
 * ```tsx
 * <Input type="search" placeholder="Search..." icon={<Search />} />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const inputVariants = cva(
  // Base styles
  'w-full bg-white/5 text-white placeholder-white/30 border border-white/10 transition-colors focus:outline-none focus:border-white/30',
  {
    variants: {
      variant: {
        default: 'rounded-lg',
        search: 'rounded-full pl-9',
        rounded: 'rounded-full',
      },
      size: {
        sm: 'h-7 px-2 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-11 px-4 text-base',
      },
      error: {
        true: 'border-red-500/50 focus:border-red-500',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      error: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Icon to display on the left */
  icon?: React.ReactNode;
  /** Icon to display on the right */
  iconRight?: React.ReactNode;
  /** Error message */
  errorMessage?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      error,
      icon,
      iconRight,
      errorMessage,
      ...props
    },
    ref
  ) => {
    const hasIcon = !!icon;
    const hasIconRight = !!iconRight;

    return (
      <div className="relative w-full">
        {hasIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            inputVariants({ variant, size, error, className }),
            hasIcon && 'pl-9',
            hasIconRight && 'pr-9'
          )}
          {...props}
        />
        {hasIconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            {iconRight}
          </div>
        )}
        {errorMessage && (
          <p className="mt-1 text-xs text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { inputVariants };
