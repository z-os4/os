/**
 * Animation Types
 *
 * Core type definitions for the animation system.
 */

/**
 * CSS easing functions.
 * 'spring' is a custom cubic-bezier approximation.
 */
export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | (string & {});

/**
 * Animation configuration options.
 */
export interface AnimationConfig {
  /** Duration in milliseconds. Default: 200 */
  duration?: number;
  /** Delay before animation starts in milliseconds. Default: 0 */
  delay?: number;
  /** Easing function. Default: 'ease-out' */
  easing?: EasingFunction;
}

/**
 * Animation lifecycle state.
 */
export type AnimationState = 'entering' | 'entered' | 'exiting' | 'exited';

/**
 * Direction for directional animations like Slide.
 */
export type SlideDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Maps easing names to CSS values.
 */
export const EASING_MAP: Record<string, string> = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  // Spring approximation using cubic-bezier
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

/**
 * Resolves an easing function name to its CSS value.
 */
export function resolveEasing(easing: EasingFunction): string {
  return EASING_MAP[easing] ?? easing;
}
