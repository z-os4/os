/**
 * useAnimateValue Hook
 *
 * Animates a numeric value over time using requestAnimationFrame.
 */

import { useState, useEffect, useRef } from 'react';
import type { EasingFunction } from './types';
import { useReducedMotion } from '../a11y';

export interface UseAnimateValueOptions {
  /** Duration in milliseconds. Default: 200 */
  duration?: number;
  /** Easing function. Default: 'ease-out' */
  easing?: EasingFunction;
}

/**
 * Easing functions for animation.
 */
const easingFunctions: Record<string, (t: number) => number> = {
  linear: (t) => t,
  ease: (t) => t * t * (3 - 2 * t),
  'ease-in': (t) => t * t,
  'ease-out': (t) => t * (2 - t),
  'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  spring: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * Resolves easing function by name or returns linear as fallback.
 */
function resolveEasingFn(easing: EasingFunction): (t: number) => number {
  return easingFunctions[easing] ?? easingFunctions.linear;
}

/**
 * Animates a numeric value from current to target value.
 *
 * @param targetValue - The value to animate toward
 * @param options - Animation options
 * @returns The current animated value
 */
export function useAnimateValue(
  targetValue: number,
  options: UseAnimateValueOptions = {}
): number {
  const { duration = 200, easing = 'ease-out' } = options;

  const prefersReducedMotion = useReducedMotion();
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  const [currentValue, setCurrentValue] = useState(targetValue);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(targetValue);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip animation if reduced motion or zero duration
    if (effectiveDuration === 0) {
      setCurrentValue(targetValue);
      return;
    }

    // Cancel any ongoing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    startValueRef.current = currentValue;
    startTimeRef.current = null;

    const easingFn = resolveEasingFn(easing);

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / effectiveDuration, 1);
      const easedProgress = easingFn(progress);

      const newValue =
        startValueRef.current + (targetValue - startValueRef.current) * easedProgress;
      setCurrentValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, effectiveDuration, easing]);

  return currentValue;
}
