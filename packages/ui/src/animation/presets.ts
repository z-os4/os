/**
 * Animation Presets
 *
 * Pre-configured animation class combinations for common transitions.
 * Uses Tailwind CSS classes.
 */

export interface TransitionPreset {
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}

/**
 * Common animation presets using Tailwind classes.
 */
export const PRESETS = {
  // Fade animations
  fadeIn: {
    enter: 'transition-opacity duration-200 ease-out',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'transition-opacity duration-150 ease-in',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  },

  fadeInFast: {
    enter: 'transition-opacity duration-100 ease-out',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'transition-opacity duration-75 ease-in',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  },

  fadeInSlow: {
    enter: 'transition-opacity duration-300 ease-out',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'transition-opacity duration-200 ease-in',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  },

  // Scale animations
  scaleIn: {
    enter: 'transition-transform duration-200 ease-out',
    enterFrom: 'scale-95 opacity-0',
    enterTo: 'scale-100 opacity-100',
    leave: 'transition-transform duration-150 ease-in',
    leaveFrom: 'scale-100 opacity-100',
    leaveTo: 'scale-95 opacity-0',
  },

  scaleInBounce: {
    enter: 'transition-transform duration-300',
    enterFrom: 'scale-90 opacity-0',
    enterTo: 'scale-100 opacity-100',
    leave: 'transition-transform duration-200 ease-in',
    leaveFrom: 'scale-100 opacity-100',
    leaveTo: 'scale-90 opacity-0',
  },

  popIn: {
    enter: 'transition-all duration-200',
    enterFrom: 'scale-50 opacity-0',
    enterTo: 'scale-100 opacity-100',
    leave: 'transition-all duration-150 ease-in',
    leaveFrom: 'scale-100 opacity-100',
    leaveTo: 'scale-50 opacity-0',
  },

  // Slide animations
  slideUp: {
    enter: 'transition-all duration-200 ease-out',
    enterFrom: 'translate-y-4 opacity-0',
    enterTo: 'translate-y-0 opacity-100',
    leave: 'transition-all duration-150 ease-in',
    leaveFrom: 'translate-y-0 opacity-100',
    leaveTo: 'translate-y-4 opacity-0',
  },

  slideDown: {
    enter: 'transition-all duration-200 ease-out',
    enterFrom: '-translate-y-4 opacity-0',
    enterTo: 'translate-y-0 opacity-100',
    leave: 'transition-all duration-150 ease-in',
    leaveFrom: 'translate-y-0 opacity-100',
    leaveTo: '-translate-y-4 opacity-0',
  },

  slideLeft: {
    enter: 'transition-all duration-200 ease-out',
    enterFrom: 'translate-x-4 opacity-0',
    enterTo: 'translate-x-0 opacity-100',
    leave: 'transition-all duration-150 ease-in',
    leaveFrom: 'translate-x-0 opacity-100',
    leaveTo: 'translate-x-4 opacity-0',
  },

  slideRight: {
    enter: 'transition-all duration-200 ease-out',
    enterFrom: '-translate-x-4 opacity-0',
    enterTo: 'translate-x-0 opacity-100',
    leave: 'transition-all duration-150 ease-in',
    leaveFrom: 'translate-x-0 opacity-100',
    leaveTo: '-translate-x-4 opacity-0',
  },

  // Panel slides (full width/height)
  slideInFromRight: {
    enter: 'transition-transform duration-300 ease-out',
    enterFrom: 'translate-x-full',
    enterTo: 'translate-x-0',
    leave: 'transition-transform duration-200 ease-in',
    leaveFrom: 'translate-x-0',
    leaveTo: 'translate-x-full',
  },

  slideInFromLeft: {
    enter: 'transition-transform duration-300 ease-out',
    enterFrom: '-translate-x-full',
    enterTo: 'translate-x-0',
    leave: 'transition-transform duration-200 ease-in',
    leaveFrom: 'translate-x-0',
    leaveTo: '-translate-x-full',
  },

  slideInFromTop: {
    enter: 'transition-transform duration-300 ease-out',
    enterFrom: '-translate-y-full',
    enterTo: 'translate-y-0',
    leave: 'transition-transform duration-200 ease-in',
    leaveFrom: 'translate-y-0',
    leaveTo: '-translate-y-full',
  },

  slideInFromBottom: {
    enter: 'transition-transform duration-300 ease-out',
    enterFrom: 'translate-y-full',
    enterTo: 'translate-y-0',
    leave: 'transition-transform duration-200 ease-in',
    leaveFrom: 'translate-y-0',
    leaveTo: 'translate-y-full',
  },

  // Modal/Dialog animations
  modal: {
    enter: 'transition-all duration-200 ease-out',
    enterFrom: 'opacity-0 scale-95 translate-y-4',
    enterTo: 'opacity-100 scale-100 translate-y-0',
    leave: 'transition-all duration-150 ease-in',
    leaveFrom: 'opacity-100 scale-100 translate-y-0',
    leaveTo: 'opacity-0 scale-95 translate-y-4',
  },

  // Overlay/backdrop animations
  overlay: {
    enter: 'transition-opacity duration-200 ease-out',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'transition-opacity duration-150 ease-in',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  },

  // Menu/dropdown animations
  dropdown: {
    enter: 'transition-all duration-150 ease-out',
    enterFrom: 'opacity-0 scale-95 -translate-y-1',
    enterTo: 'opacity-100 scale-100 translate-y-0',
    leave: 'transition-all duration-100 ease-in',
    leaveFrom: 'opacity-100 scale-100 translate-y-0',
    leaveTo: 'opacity-0 scale-95 -translate-y-1',
  },

  // Toast notifications
  toast: {
    enter: 'transition-all duration-300 ease-out',
    enterFrom: 'opacity-0 translate-x-full',
    enterTo: 'opacity-100 translate-x-0',
    leave: 'transition-all duration-200 ease-in',
    leaveFrom: 'opacity-100 translate-x-0',
    leaveTo: 'opacity-0 translate-x-full',
  },

  // Tooltip
  tooltip: {
    enter: 'transition-all duration-150 ease-out',
    enterFrom: 'opacity-0 scale-95',
    enterTo: 'opacity-100 scale-100',
    leave: 'transition-all duration-100 ease-in',
    leaveFrom: 'opacity-100 scale-100',
    leaveTo: 'opacity-0 scale-95',
  },

  // Collapse (height animation handled separately)
  collapse: {
    enter: 'transition-all duration-200 ease-out overflow-hidden',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'transition-all duration-150 ease-in overflow-hidden',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  },
} as const;

export type PresetName = keyof typeof PRESETS;

/**
 * Get a preset by name.
 */
export function getPreset(name: PresetName): TransitionPreset {
  return PRESETS[name];
}

/**
 * Merge a preset with custom overrides.
 */
export function mergePreset(
  name: PresetName,
  overrides: Partial<TransitionPreset>
): TransitionPreset {
  return { ...PRESETS[name], ...overrides };
}
