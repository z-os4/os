/**
 * Transition Component
 *
 * Base transition component using CSS classes for enter/exit animations.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AnimationState } from './types';
import { useReducedMotion } from '../a11y';

export interface TransitionProps {
  /** Whether the element should be visible */
  show: boolean;
  /** CSS classes for enter transition */
  enter?: string;
  /** Initial state classes (applied on entering) */
  enterFrom?: string;
  /** Final state classes (applied after enter completes) */
  enterTo?: string;
  /** CSS classes for leave transition */
  leave?: string;
  /** Initial state for leaving */
  leaveFrom?: string;
  /** Final state after leave completes */
  leaveTo?: string;
  /** Duration in milliseconds (overrides CSS duration) */
  duration?: number;
  /** Whether to animate on initial mount */
  appear?: boolean;
  /** Callback when enter animation completes */
  onEntered?: () => void;
  /** Callback when exit animation completes */
  onExited?: () => void;
  /** Additional className for the wrapper */
  className?: string;
  /** The element or render function to transition */
  children: React.ReactNode | ((state: AnimationState) => React.ReactNode);
}

/**
 * Transition component using CSS classes for enter/exit animations.
 *
 * @example
 * <Transition
 *   show={isOpen}
 *   enter="transition-opacity duration-200"
 *   enterFrom="opacity-0"
 *   enterTo="opacity-100"
 *   leave="transition-opacity duration-150"
 *   leaveFrom="opacity-100"
 *   leaveTo="opacity-0"
 * >
 *   <div>Content</div>
 * </Transition>
 */
export function Transition({
  show,
  enter = '',
  enterFrom = '',
  enterTo = '',
  leave = '',
  leaveFrom = '',
  leaveTo = '',
  duration,
  appear = false,
  onEntered,
  onExited,
  className = '',
  children,
}: TransitionProps): React.ReactElement | null {
  const prefersReducedMotion = useReducedMotion();

  // Determine initial state
  const getInitialState = (): AnimationState => {
    if (show) {
      return appear ? 'entering' : 'entered';
    }
    return 'exited';
  };

  const [state, setState] = useState<AnimationState>(getInitialState);
  const [shouldRender, setShouldRender] = useState(show);

  const nodeRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Parse duration from CSS classes or use prop
  const parseDuration = (transitionClasses: string): number => {
    if (duration !== undefined) return duration;

    // Try to parse duration from Tailwind classes
    const durationMatch = transitionClasses.match(/duration-(\d+)/);
    if (durationMatch) {
      return parseInt(durationMatch[1], 10);
    }
    return 200; // Default
  };

  const clearPendingTimeout = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    // Handle first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!appear && show) {
        setShouldRender(true);
        setState('entered');
        return;
      }
    }

    clearPendingTimeout();

    if (prefersReducedMotion) {
      // Skip animations
      if (show) {
        setShouldRender(true);
        setState('entered');
        onEntered?.();
      } else {
        setState('exited');
        setShouldRender(false);
        onExited?.();
      }
      return;
    }

    if (show) {
      // Enter transition
      setShouldRender(true);
      setState('entering');

      const enterDuration = parseDuration(enter);

      // Force reflow before applying enterTo classes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          timeoutRef.current = setTimeout(() => {
            setState('entered');
            onEntered?.();
          }, enterDuration);
        });
      });
    } else {
      // Exit transition
      setState('exiting');

      const leaveDuration = parseDuration(leave);

      timeoutRef.current = setTimeout(() => {
        setState('exited');
        setShouldRender(false);
        onExited?.();
      }, leaveDuration);
    }

    return clearPendingTimeout;
  }, [show, prefersReducedMotion, appear]);

  if (!shouldRender) {
    return null;
  }

  // Build class string based on state
  const getClasses = (): string => {
    const classes: string[] = [className];

    switch (state) {
      case 'entering':
        classes.push(enter, enterFrom);
        // Apply enterTo after initial frame for animation
        requestAnimationFrame(() => {
          if (nodeRef.current) {
            nodeRef.current.className = [className, enter, enterTo]
              .filter(Boolean)
              .join(' ');
          }
        });
        break;
      case 'entered':
        classes.push(enterTo);
        break;
      case 'exiting':
        classes.push(leave, leaveFrom);
        requestAnimationFrame(() => {
          if (nodeRef.current) {
            nodeRef.current.className = [className, leave, leaveTo]
              .filter(Boolean)
              .join(' ');
          }
        });
        break;
      case 'exited':
        classes.push(leaveTo);
        break;
    }

    return classes.filter(Boolean).join(' ');
  };

  // Render function for child access to state
  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(state);
    }
    return children;
  };

  return (
    <div ref={nodeRef} className={getClasses()}>
      {renderChildren()}
    </div>
  );
}
