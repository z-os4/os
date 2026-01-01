/**
 * SkipLink Component
 *
 * Skip navigation link that becomes visible on focus.
 * Allows keyboard users to bypass repetitive navigation
 * and jump directly to main content.
 *
 * @example
 * ```tsx
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 * <SkipLink href="#search">Skip to search</SkipLink>
 * <nav>...</nav>
 * <main id="main-content">...</main>
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Target element ID (with or without #) */
  href: string;
  /** Link text */
  children: React.ReactNode;
  /** Focus the target element after clicking */
  focusTarget?: boolean;
}

export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ href, children, focusTarget = true, className, onClick, ...props }, ref) => {
    // Normalize href to ensure it starts with #
    const normalizedHref = href.startsWith('#') ? href : `#${href}`;

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Call original onClick if provided
      onClick?.(event);

      if (event.defaultPrevented) return;

      // Focus the target element
      if (focusTarget) {
        const targetId = normalizedHref.slice(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Make element focusable if it's not already
          if (!targetElement.hasAttribute('tabindex')) {
            targetElement.setAttribute('tabindex', '-1');
          }

          // Focus the target
          targetElement.focus({ preventScroll: false });

          // Scroll into view if needed
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    return (
      <a
        ref={ref}
        href={normalizedHref}
        onClick={handleClick}
        className={cn(
          // Base styles - hidden but accessible
          'absolute left-0 top-0 z-[9999]',
          'px-4 py-2 rounded-br-lg',
          'bg-blue-600 text-white font-medium text-sm',
          'shadow-lg',
          // Hidden by default
          '-translate-y-full opacity-0',
          // Visible on focus
          'focus:translate-y-0 focus:opacity-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
          // Smooth transition
          'transition-all duration-200 ease-out',
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

SkipLink.displayName = 'SkipLink';

/**
 * SkipLinks Container
 *
 * Container for multiple skip links. Places them in a logical order.
 *
 * @example
 * ```tsx
 * <SkipLinks>
 *   <SkipLink href="#main">Skip to main content</SkipLink>
 *   <SkipLink href="#nav">Skip to navigation</SkipLink>
 *   <SkipLink href="#footer">Skip to footer</SkipLink>
 * </SkipLinks>
 * ```
 */
export interface SkipLinksProps {
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ children, className }) => {
  return (
    <nav
      aria-label="Skip links"
      className={cn(
        'fixed top-0 left-0 z-[9999]',
        'flex flex-col gap-1',
        className
      )}
    >
      {children}
    </nav>
  );
};

SkipLinks.displayName = 'SkipLinks';
