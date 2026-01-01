/**
 * Collapse Component
 *
 * Height-based collapse/expand animation for accordion-style content.
 */

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { AnimationState } from './types';
import { useReducedMotion } from '../a11y';

export interface CollapseProps {
  /** Whether the content should be expanded */
  show: boolean;
  /** Duration in milliseconds. Default: 200 */
  duration?: number;
  /** Whether to animate on initial mount. Default: false */
  appear?: boolean;
  /** Callback when expand animation completes */
  onEntered?: () => void;
  /** Callback when collapse animation completes */
  onExited?: () => void;
  /** Additional className */
  className?: string;
  /** Content to collapse/expand */
  children: React.ReactNode;
}

/**
 * Collapse component for height-based expand/collapse animations.
 *
 * Uses CSS transitions with dynamically measured heights.
 *
 * @example
 * <Collapse show={isExpanded}>
 *   <div>Collapsible content</div>
 * </Collapse>
 */
export function Collapse({
  show,
  duration = 200,
  appear = false,
  onEntered,
  onExited,
  className = '',
  children,
}: CollapseProps): React.ReactElement | null {
  const prefersReducedMotion = useReducedMotion();
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  const contentRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AnimationState>(() => {
    if (show) {
      return appear ? 'entering' : 'entered';
    }
    return 'exited';
  });
  const [height, setHeight] = useState<number | 'auto'>(() => {
    if (show && !appear) return 'auto';
    return 0;
  });

  const isFirstRender = useRef(true);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimeout = useCallback(() => {
    if (animationTimeoutRef.current !== null) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  // Measure content height
  const measureHeight = useCallback((): number => {
    if (contentRef.current) {
      return contentRef.current.scrollHeight;
    }
    return 0;
  }, []);

  useEffect(() => {
    // Skip first render if not appearing
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!appear && show) {
        return;
      }
    }

    clearPendingTimeout();

    if (prefersReducedMotion) {
      if (show) {
        setHeight('auto');
        setState('entered');
        onEntered?.();
      } else {
        setHeight(0);
        setState('exited');
        onExited?.();
      }
      return;
    }

    if (show) {
      // Expand
      setState('entering');

      // Set explicit height for animation
      const contentHeight = measureHeight();
      setHeight(contentHeight);

      animationTimeoutRef.current = setTimeout(() => {
        setState('entered');
        setHeight('auto'); // Switch to auto for responsive content
        onEntered?.();
      }, effectiveDuration);
    } else {
      // Collapse
      // First, set explicit height from auto
      const contentHeight = measureHeight();
      setHeight(contentHeight);

      // Force reflow
      void contentRef.current?.offsetHeight;

      // Then trigger collapse
      requestAnimationFrame(() => {
        setState('exiting');
        setHeight(0);

        animationTimeoutRef.current = setTimeout(() => {
          setState('exited');
          onExited?.();
        }, effectiveDuration);
      });
    }

    return clearPendingTimeout;
  }, [show, effectiveDuration, appear, prefersReducedMotion, measureHeight, clearPendingTimeout, onEntered, onExited]);

  // Don't render if fully collapsed and exited
  const shouldRender = state !== 'exited' || show;

  if (!shouldRender) {
    return null;
  }

  const isAnimating = state === 'entering' || state === 'exiting';

  const style: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: isAnimating || state === 'exited' ? 'hidden' : undefined,
    transition: isAnimating
      ? `height ${effectiveDuration}ms ease-out`
      : undefined,
  };

  return (
    <div style={style} className={className}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
