/**
 * Animation Module
 *
 * Reusable animation components and hooks using CSS transitions.
 * No external animation libraries required.
 */

// Types
export type {
  EasingFunction,
  AnimationConfig,
  AnimationState,
  SlideDirection,
} from './types';
export { EASING_MAP, resolveEasing } from './types';

// Hooks
// Note: useReducedMotion is exported from '../a11y' - re-export here for convenience
export { useReducedMotion } from '../a11y';
export { useTransition } from './useTransition';
export type { UseTransitionOptions, UseTransitionResult } from './useTransition';
export { useAnimateValue } from './useAnimateValue';
export type { UseAnimateValueOptions } from './useAnimateValue';

// Components
export { Transition } from './Transition';
export type { TransitionProps } from './Transition';

export { Fade } from './Fade';
export type { FadeProps } from './Fade';

export { Scale } from './Scale';
export type { ScaleProps } from './Scale';

export { Slide } from './Slide';
export type { SlideProps } from './Slide';

export { Collapse } from './Collapse';
export type { CollapseProps } from './Collapse';

export { AnimatePresence } from './AnimatePresence';
export type { AnimatePresenceProps } from './AnimatePresence';

// Presets
export { PRESETS, getPreset, mergePreset } from './presets';
export type { TransitionPreset, PresetName } from './presets';
