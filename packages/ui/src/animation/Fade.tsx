/**
 * Fade Component
 *
 * Simple fade in/out animation component.
 */

'use client';

import React from 'react';
import { Transition, type TransitionProps } from './Transition';
import { PRESETS } from './presets';

export interface FadeProps {
  /** Whether the element should be visible */
  show: boolean;
  /** Duration in milliseconds. Default: 200 */
  duration?: number;
  /** Whether to animate on initial mount. Default: false */
  appear?: boolean;
  /** Callback when enter animation completes */
  onEntered?: () => void;
  /** Callback when exit animation completes */
  onExited?: () => void;
  /** Additional className */
  className?: string;
  /** Content to fade */
  children: React.ReactNode;
}

/**
 * Fade component for simple opacity transitions.
 *
 * @example
 * <Fade show={isVisible}>
 *   <div>Fading content</div>
 * </Fade>
 */
export function Fade({
  show,
  duration = 200,
  appear = false,
  onEntered,
  onExited,
  className = '',
  children,
}: FadeProps): React.ReactElement | null {
  const preset = PRESETS.fadeIn;

  // Override duration in transition classes if specified
  const enter = duration !== 200
    ? preset.enter.replace(/duration-\d+/, `duration-[${duration}ms]`)
    : preset.enter;
  const leave = duration !== 200
    ? preset.leave.replace(/duration-\d+/, `duration-[${Math.round(duration * 0.75)}ms]`)
    : preset.leave;

  return (
    <Transition
      show={show}
      enter={enter}
      enterFrom={preset.enterFrom}
      enterTo={preset.enterTo}
      leave={leave}
      leaveFrom={preset.leaveFrom}
      leaveTo={preset.leaveTo}
      duration={duration}
      appear={appear}
      onEntered={onEntered}
      onExited={onExited}
      className={className}
    >
      {children}
    </Transition>
  );
}
