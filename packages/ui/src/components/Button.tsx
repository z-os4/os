/**
 * Button Component
 *
 * macOS-style button with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
        secondary: 'bg-white/10 text-white hover:bg-white/20 active:bg-white/25',
        tertiary: 'bg-transparent text-white hover:bg-white/10 active:bg-white/15',
        destructive: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 active:bg-red-500/40',
        ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
        operator: 'bg-orange-500 text-white hover:bg-orange-400',
        function: 'bg-gray-400 text-black hover:bg-gray-300',
        number: 'bg-gray-700 text-white hover:bg-gray-600',
      },
      size: {
        sm: 'h-7 px-2 text-xs rounded-md gap-1',
        md: 'h-9 px-3 text-sm rounded-lg gap-2',
        lg: 'h-11 px-4 text-base rounded-lg gap-2',
        icon: 'h-8 w-8 rounded-lg',
        'icon-sm': 'h-6 w-6 rounded-md',
        'icon-lg': 'h-10 w-10 rounded-xl',
        calc: 'h-14 rounded-full text-2xl font-light',
      },
      active: {
        true: 'ring-2 ring-white/50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      active: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Loading state - shows spinner */
  loading?: boolean;
  /** Icon to display before children */
  icon?: React.ReactNode;
  /** Icon to display after children */
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      active,
      loading,
      icon,
      iconRight,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, active, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
        {iconRight}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };
