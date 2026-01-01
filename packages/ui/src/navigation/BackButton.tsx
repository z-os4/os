/**
 * BackButton Component
 *
 * Navigation button for going back, with glass styling.
 *
 * @example
 * ```tsx
 * <BackButton onClick={() => router.back()} />
 * <BackButton href="/previous" label="Previous Page" />
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import { NAV_SIZE_CLASSES, NAV_GLASS_STYLES, type NavSize } from './types';

export interface BackButtonProps {
  /** Click handler */
  onClick?: () => void;
  /** Link destination (alternative to onClick) */
  href?: string;
  /** Button label (default: "Back") */
  label?: string;
  /** Show label text */
  showLabel?: boolean;
  /** Size variant */
  size?: NavSize;
  /** Visual variant */
  variant?: 'default' | 'ghost' | 'subtle';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

/** Arrow left icon */
const ArrowLeft: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

export const BackButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BackButtonProps
>(
  (
    {
      onClick,
      href,
      label = 'Back',
      showLabel = true,
      size = 'md',
      variant = 'default',
      disabled = false,
      className,
    },
    ref
  ) => {
    const sizeClasses = NAV_SIZE_CLASSES[size];

    const baseClasses = cn(
      'inline-flex items-center',
      sizeClasses.gap,
      showLabel ? sizeClasses.padding : 'p-2',
      sizeClasses.text,
      'font-medium rounded-lg transition-all',
      NAV_GLASS_STYLES.focus,
      disabled && NAV_GLASS_STYLES.disabled
    );

    const variantClasses = {
      default: cn(
        'bg-white/5 border border-white/10',
        'text-white/70 hover:text-white hover:bg-white/10'
      ),
      ghost: cn('text-white/70 hover:text-white hover:bg-white/5'),
      subtle: cn('text-white/50 hover:text-white'),
    };

    const content = (
      <>
        <ArrowLeft className={sizeClasses.icon} />
        {showLabel && <span>{label}</span>}
      </>
    );

    const combinedClasses = cn(baseClasses, variantClasses[variant], className);

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={disabled ? (e) => e.preventDefault() : undefined}
          className={combinedClasses}
          aria-disabled={disabled}
          aria-label={!showLabel ? label : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={combinedClasses}
        aria-label={!showLabel ? label : undefined}
      >
        {content}
      </button>
    );
  }
);

BackButton.displayName = 'BackButton';
