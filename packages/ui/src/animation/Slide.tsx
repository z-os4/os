/**
 * Slide Component
 *
 * Slide in/out animation from any direction.
 */

'use client';

import React from 'react';
import { Transition } from './Transition';
import type { SlideDirection } from './types';

export interface SlideProps {
  /** Whether the element should be visible */
  show: boolean;
  /** Direction to slide from. Default: 'up' */
  direction?: SlideDirection;
  /** Slide distance in pixels or Tailwind value. Default: 16 (4 in Tailwind) */
  distance?: number | string;
  /** Duration in milliseconds. Default: 200 */
  duration?: number;
  /** Whether to include fade effect. Default: true */
  withFade?: boolean;
  /** Whether to animate on initial mount. Default: false */
  appear?: boolean;
  /** Callback when enter animation completes */
  onEntered?: () => void;
  /** Callback when exit animation completes */
  onExited?: () => void;
  /** Additional className */
  className?: string;
  /** Content to slide */
  children: React.ReactNode;
}

/**
 * Get translate class based on direction.
 */
function getTranslateFrom(direction: SlideDirection, distance: number | string): string {
  const distanceValue = typeof distance === 'number' ? `${distance}px` : distance;

  // Use Tailwind's translate utilities
  const distanceMap: Record<SlideDirection, string> = {
    up: `translate-y-[${distanceValue}]`,
    down: `-translate-y-[${distanceValue}]`,
    left: `translate-x-[${distanceValue}]`,
    right: `-translate-x-[${distanceValue}]`,
  };

  return distanceMap[direction];
}

/**
 * Get translate reset class based on direction.
 */
function getTranslateTo(direction: SlideDirection): string {
  if (direction === 'up' || direction === 'down') {
    return 'translate-y-0';
  }
  return 'translate-x-0';
}

/**
 * Slide component for directional slide transitions.
 *
 * @example
 * <Slide show={isVisible} direction="up">
 *   <div>Slides up</div>
 * </Slide>
 *
 * @example
 * <Slide show={isVisible} direction="right" distance={100} duration={300}>
 *   <div>Slides from right</div>
 * </Slide>
 */
export function Slide({
  show,
  direction = 'up',
  distance = 16,
  duration = 200,
  withFade = true,
  appear = false,
  onEntered,
  onExited,
  className = '',
  children,
}: SlideProps): React.ReactElement | null {
  const translateFrom = getTranslateFrom(direction, distance);
  const translateTo = getTranslateTo(direction);
  const fadeClasses = withFade ? ' opacity-0' : '';
  const fadeToClasses = withFade ? ' opacity-100' : '';

  const enter = `transition-all duration-[${duration}ms] ease-out`;
  const enterFrom = `${translateFrom}${fadeClasses}`;
  const enterTo = `${translateTo}${fadeToClasses}`;
  const leave = `transition-all duration-[${Math.round(duration * 0.75)}ms] ease-in`;
  const leaveFrom = `${translateTo}${fadeToClasses}`;
  const leaveTo = `${translateFrom}${fadeClasses}`;

  return (
    <Transition
      show={show}
      enter={enter}
      enterFrom={enterFrom}
      enterTo={enterTo}
      leave={leave}
      leaveFrom={leaveFrom}
      leaveTo={leaveTo}
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
