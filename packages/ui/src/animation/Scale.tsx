/**
 * Scale Component
 *
 * Scale in/out animation component.
 */

'use client';

import React from 'react';
import { Transition } from './Transition';
import { PRESETS } from './presets';

export interface ScaleProps {
  /** Whether the element should be visible */
  show: boolean;
  /** Duration in milliseconds. Default: 200 */
  duration?: number;
  /** Initial scale value (0-1). Default: 0.95 */
  initialScale?: number;
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
  /** Content to scale */
  children: React.ReactNode;
}

/**
 * Scale component for scale in/out transitions with optional fade.
 *
 * @example
 * <Scale show={isVisible}>
 *   <div>Scaling content</div>
 * </Scale>
 *
 * @example
 * <Scale show={isVisible} initialScale={0.5} duration={300}>
 *   <div>More dramatic scale</div>
 * </Scale>
 */
export function Scale({
  show,
  duration = 200,
  initialScale = 0.95,
  withFade = true,
  appear = false,
  onEntered,
  onExited,
  className = '',
  children,
}: ScaleProps): React.ReactElement | null {
  // Map initialScale to Tailwind scale class
  const getScaleClass = (scale: number): string => {
    // Common Tailwind scale values
    const scaleMap: Record<number, string> = {
      0: 'scale-0',
      0.5: 'scale-50',
      0.75: 'scale-75',
      0.9: 'scale-90',
      0.95: 'scale-95',
      1: 'scale-100',
      1.05: 'scale-105',
      1.1: 'scale-110',
      1.25: 'scale-125',
      1.5: 'scale-150',
    };

    return scaleMap[scale] ?? `scale-[${scale}]`;
  };

  const scaleFromClass = getScaleClass(initialScale);
  const fadeClasses = withFade ? ' opacity-0' : '';
  const fadeToClasses = withFade ? ' opacity-100' : '';

  const enter = `transition-all duration-[${duration}ms] ease-out`;
  const enterFrom = `${scaleFromClass}${fadeClasses}`;
  const enterTo = `scale-100${fadeToClasses}`;
  const leave = `transition-all duration-[${Math.round(duration * 0.75)}ms] ease-in`;
  const leaveFrom = `scale-100${fadeToClasses}`;
  const leaveTo = `${scaleFromClass}${fadeClasses}`;

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
