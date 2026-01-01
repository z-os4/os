/**
 * useTransition Hook
 *
 * Manages animation state for enter/exit transitions.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { AnimationState } from './types';
import { useReducedMotion } from '../a11y';

export interface UseTransitionOptions {
  /** Duration in milliseconds. Default: 200 */
  duration?: number;
  /** Callback when enter animation completes */
  onEntered?: () => void;
  /** Callback when exit animation completes */
  onExited?: () => void;
  /** Skip initial enter animation. Default: false */
  appear?: boolean;
}

export interface UseTransitionResult {
  /** Current animation state */
  state: AnimationState;
  /** Whether the element should be rendered */
  shouldRender: boolean;
}

/**
 * Hook for managing enter/exit transition states.
 *
 * @param show - Whether the element should be visible
 * @param options - Transition options
 * @returns Current state and render flag
 */
export function useTransition(
  show: boolean,
  options: UseTransitionOptions = {}
): UseTransitionResult {
  const { duration = 200, onEntered, onExited, appear = false } = options;

  const prefersReducedMotion = useReducedMotion();
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  const [state, setState] = useState<AnimationState>(() => {
    if (show) {
      return appear ? 'entering' : 'entered';
    }
    return 'exited';
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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

    if (show) {
      // Start entering
      setState('entering');

      // Transition to entered after duration
      timeoutRef.current = setTimeout(() => {
        setState('entered');
        onEntered?.();
      }, effectiveDuration);
    } else {
      // Start exiting
      setState('exiting');

      // Transition to exited after duration
      timeoutRef.current = setTimeout(() => {
        setState('exited');
        onExited?.();
      }, effectiveDuration);
    }

    return clearPendingTimeout;
  }, [show, effectiveDuration, appear, clearPendingTimeout, onEntered, onExited]);

  const shouldRender = state !== 'exited';

  return { state, shouldRender };
}
