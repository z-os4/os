/**
 * LinkButton Component
 *
 * Button styled as a link for navigation actions.
 *
 * @example
 * ```tsx
 * <LinkButton href="/settings">Go to Settings</LinkButton>
 * <LinkButton onClick={handleClick} icon={<ExternalLink />}>
 *   Open External
 * </LinkButton>
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import { NAV_SIZE_CLASSES, NAV_GLASS_STYLES, type NavSize } from './types';

export interface LinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> {
  /** Click handler (for button-like behavior) */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  /** Leading icon */
  icon?: React.ReactNode;
  /** Trailing icon */
  iconRight?: React.ReactNode;
  /** Size variant */
  size?: NavSize;
  /** Whether link is disabled */
  disabled?: boolean;
  /** Visual variant */
  variant?: 'default' | 'muted' | 'primary';
  /** Render as button (no href) */
  asButton?: boolean;
}

export const LinkButton = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  LinkButtonProps
>(
  (
    {
      children,
      onClick,
      icon,
      iconRight,
      size = 'md',
      disabled = false,
      variant = 'default',
      asButton = false,
      className,
      href,
      ...props
    },
    ref
  ) => {
    const sizeClasses = NAV_SIZE_CLASSES[size];

    const baseClasses = cn(
      'inline-flex items-center',
      sizeClasses.gap,
      sizeClasses.text,
      'transition-colors cursor-pointer',
      NAV_GLASS_STYLES.focus,
      'rounded',
      disabled && NAV_GLASS_STYLES.disabled
    );

    const variantClasses = {
      default: cn(
        'text-blue-400 hover:text-blue-300',
        'hover:underline underline-offset-2'
      ),
      muted: cn(
        'text-white/60 hover:text-white',
        'hover:underline underline-offset-2'
      ),
      primary: cn(
        'text-white hover:text-white/80',
        'hover:underline underline-offset-2'
      ),
    };

    const content = (
      <>
        {icon && (
          <span className={cn('flex-shrink-0', sizeClasses.icon)}>{icon}</span>
        )}
        {children}
        {iconRight && (
          <span className={cn('flex-shrink-0', sizeClasses.icon)}>
            {iconRight}
          </span>
        )}
      </>
    );

    const combinedClasses = cn(baseClasses, variantClasses[variant], className);

    // Render as button if no href or explicitly requested
    if (asButton || !href) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
          disabled={disabled}
          className={combinedClasses}
        >
          {content}
        </button>
      );
    }

    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={combinedClasses}
        aria-disabled={disabled}
        {...props}
      >
        {content}
      </a>
    );
  }
);

LinkButton.displayName = 'LinkButton';
