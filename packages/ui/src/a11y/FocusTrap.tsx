/**
 * FocusTrap Component
 *
 * Traps keyboard focus within a container. Essential for modals,
 * dialogs, and dropdowns to ensure keyboard users cannot tab
 * outside the interactive region.
 *
 * @example
 * ```tsx
 * <FocusTrap>
 *   <Dialog>
 *     <DialogTitle>Confirm Action</DialogTitle>
 *     <DialogContent>Are you sure?</DialogContent>
 *     <Button onClick={handleCancel}>Cancel</Button>
 *     <Button onClick={handleConfirm}>Confirm</Button>
 *   </Dialog>
 * </FocusTrap>
 * ```
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { FOCUSABLE_SELECTORS, type FocusTrapOptions } from './types';

export interface FocusTrapProps extends FocusTrapOptions {
  children: React.ReactNode;
  /** Whether the trap is active */
  active?: boolean;
  /** Element type for the container */
  as?: keyof JSX.IntrinsicElements;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
  return Array.from(elements).filter((el) => {
    // Filter out hidden elements
    if (el.offsetParent === null && el.style.position !== 'fixed') {
      return false;
    }
    // Filter out elements with visibility: hidden
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') {
      return false;
    }
    return true;
  });
}

export const FocusTrap = React.forwardRef<HTMLDivElement, FocusTrapProps>(
  (
    {
      children,
      active = true,
      as: Component = 'div',
      className,
      style,
      initialFocus,
      returnFocus,
      contain = true,
      excludeRefs = [],
    },
    forwardedRef
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const sentinelStartRef = useRef<HTMLDivElement>(null);
    const sentinelEndRef = useRef<HTMLDivElement>(null);

    // Combine refs
    const ref = (forwardedRef as React.RefObject<HTMLDivElement>) || containerRef;

    // Store the previously focused element
    useEffect(() => {
      if (active) {
        previousActiveElement.current = document.activeElement as HTMLElement;
      }
    }, [active]);

    // Focus initial element when trap activates
    useEffect(() => {
      if (!active || !ref.current) return;

      const focusInitial = () => {
        if (initialFocus) {
          initialFocus.focus();
          return;
        }

        const focusableElements = getFocusableElements(ref.current!);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          // If no focusable elements, focus the container
          ref.current!.setAttribute('tabindex', '-1');
          ref.current!.focus();
        }
      };

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(focusInitial);
    }, [active, initialFocus, ref]);

    // Return focus when trap deactivates
    useEffect(() => {
      return () => {
        if (active) {
          const elementToFocus = returnFocus || previousActiveElement.current;
          if (elementToFocus && typeof elementToFocus.focus === 'function') {
            // Delay focus return to allow cleanup
            requestAnimationFrame(() => {
              elementToFocus.focus();
            });
          }
        }
      };
    }, [active, returnFocus]);

    // Handle focus containment
    const handleSentinelFocus = useCallback(
      (position: 'start' | 'end') => {
        if (!active || !contain || !ref.current) return;

        const focusableElements = getFocusableElements(ref.current);
        if (focusableElements.length === 0) return;

        if (position === 'start') {
          // Came from after the trap, focus last element
          focusableElements[focusableElements.length - 1].focus();
        } else {
          // Came from before the trap, focus first element
          focusableElements[0].focus();
        }
      },
      [active, contain, ref]
    );

    // Handle escape and focus events
    useEffect(() => {
      if (!active || !contain) return;

      const handleFocusIn = (event: FocusEvent) => {
        if (!ref.current) return;

        const target = event.target as HTMLElement;

        // Check if focus went to an excluded element
        for (const excludeRef of excludeRefs) {
          if (excludeRef.current?.contains(target)) {
            return;
          }
        }

        // If focus is outside the trap, bring it back
        if (!ref.current.contains(target)) {
          event.preventDefault();
          event.stopPropagation();
          const focusableElements = getFocusableElements(ref.current);
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      };

      document.addEventListener('focusin', handleFocusIn);
      return () => {
        document.removeEventListener('focusin', handleFocusIn);
      };
    }, [active, contain, ref, excludeRefs]);

    if (!active) {
      return <>{children}</>;
    }

    return React.createElement(
      Component,
      {
        ref,
        className,
        style,
      },
      <>
        {/* Start sentinel - catches backward tab from first element */}
        <div
          ref={sentinelStartRef}
          tabIndex={0}
          onFocus={() => handleSentinelFocus('start')}
          style={{ position: 'fixed', top: 0, left: 0, width: 1, height: 0, opacity: 0 }}
          aria-hidden="true"
        />
        {children}
        {/* End sentinel - catches forward tab from last element */}
        <div
          ref={sentinelEndRef}
          tabIndex={0}
          onFocus={() => handleSentinelFocus('end')}
          style={{ position: 'fixed', top: 0, left: 0, width: 1, height: 0, opacity: 0 }}
          aria-hidden="true"
        />
      </>
    );
  }
);

FocusTrap.displayName = 'FocusTrap';
