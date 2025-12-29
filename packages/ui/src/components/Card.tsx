/**
 * Card Component
 *
 * Container component with macOS glass morphism styling.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="lg">
 *   <CardHeader>Title</CardHeader>
 *   <CardContent>Content here</CardContent>
 * </Card>
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const cardVariants = cva(
  // Base styles
  'rounded-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white/5 border border-white/10',
        elevated: 'bg-white/10 border border-white/10 shadow-lg',
        glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
        solid: 'bg-[#2c2c2c]',
        interactive: 'bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer',
      },
      padding: {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between pb-3 border-b border-white/10', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-white', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-4', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-end gap-2 pt-4 border-t border-white/10', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export { cardVariants };
