/**
 * Stepper Component
 *
 * Multi-step progress indicator with glass styling.
 *
 * @example
 * ```tsx
 * <Stepper
 *   steps={[
 *     { id: 'details', label: 'Details' },
 *     { id: 'payment', label: 'Payment' },
 *     { id: 'confirm', label: 'Confirm' },
 *   ]}
 *   currentStep={1}
 *   onChange={(step) => setCurrentStep(step)}
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { cn } from '../lib/utils';
import type { Step } from './types';
import { NAV_GLASS_STYLES } from './types';

export type { Step };

export interface StepperProps {
  /** Steps to display */
  steps: Step[];
  /** Current step index (0-indexed) */
  currentStep: number;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Step change handler */
  onChange?: (step: number) => void;
  /** Whether steps are clickable */
  clickable?: boolean;
  /** Show step numbers */
  showNumbers?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
}

/** Check icon for completed steps */
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/** Warning icon for error steps */
const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

/** Size configurations */
const SIZE_CONFIG = {
  sm: {
    indicator: 'w-6 h-6',
    iconSize: 'w-3 h-3',
    text: 'text-xs',
    descText: 'text-[10px]',
    connector: { h: 'h-0.5', w: 'w-0.5' },
    gap: 'gap-2',
  },
  md: {
    indicator: 'w-8 h-8',
    iconSize: 'w-4 h-4',
    text: 'text-sm',
    descText: 'text-xs',
    connector: { h: 'h-0.5', w: 'w-0.5' },
    gap: 'gap-3',
  },
  lg: {
    indicator: 'w-10 h-10',
    iconSize: 'w-5 h-5',
    text: 'text-base',
    descText: 'text-sm',
    connector: { h: 'h-1', w: 'w-1' },
    gap: 'gap-4',
  },
} as const;

/** Step status */
type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';

function getStepStatus(
  stepIndex: number,
  currentStep: number,
  hasError: boolean
): StepStatus {
  if (hasError) return 'error';
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'current';
  return 'upcoming';
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      currentStep,
      orientation = 'horizontal',
      onChange,
      clickable = false,
      showNumbers = true,
      size = 'md',
      className,
    },
    ref
  ) => {
    const config = SIZE_CONFIG[size];
    const isHorizontal = orientation === 'horizontal';

    const handleStepClick = useCallback(
      (index: number) => {
        if (clickable && onChange) {
          onChange(index);
        }
      },
      [clickable, onChange]
    );

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          isHorizontal ? 'flex-row items-start' : 'flex-col',
          className
        )}
        role="navigation"
        aria-label="Progress"
      >
        <ol
          className={cn(
            'flex',
            isHorizontal ? 'flex-row items-start' : 'flex-col',
            config.gap
          )}
        >
          {steps.map((step, index) => {
            const status = getStepStatus(index, currentStep, !!step.error);
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.id}
                className={cn(
                  'flex',
                  isHorizontal ? 'flex-1 items-start' : 'items-start'
                )}
              >
                {/* Step content */}
                <div
                  className={cn(
                    'flex',
                    isHorizontal ? 'flex-col items-center' : 'flex-row',
                    config.gap
                  )}
                >
                  {/* Indicator + Connector */}
                  <div
                    className={cn(
                      'flex items-center',
                      isHorizontal ? 'flex-col' : 'flex-row'
                    )}
                  >
                    {/* Step indicator */}
                    <button
                      type="button"
                      onClick={() => handleStepClick(index)}
                      disabled={!clickable}
                      className={cn(
                        config.indicator,
                        'rounded-full flex items-center justify-center',
                        'font-medium transition-all',
                        NAV_GLASS_STYLES.focus,
                        clickable && 'cursor-pointer',
                        !clickable && 'cursor-default',
                        // Status styles
                        status === 'completed' &&
                          'bg-green-500/30 border border-green-500/50 text-green-400',
                        status === 'current' &&
                          'bg-blue-500/30 border-2 border-blue-500 text-white',
                        status === 'upcoming' &&
                          'bg-white/5 border border-white/20 text-white/40',
                        status === 'error' &&
                          'bg-red-500/30 border border-red-500/50 text-red-400'
                      )}
                      aria-current={status === 'current' ? 'step' : undefined}
                      aria-label={`Step ${index + 1}: ${step.label}${
                        step.optional ? ' (optional)' : ''
                      }, ${status}`}
                    >
                      {status === 'completed' ? (
                        <CheckIcon className={config.iconSize} />
                      ) : status === 'error' ? (
                        <WarningIcon className={config.iconSize} />
                      ) : step.icon ? (
                        <span className={config.iconSize}>{step.icon}</span>
                      ) : showNumbers ? (
                        <span className={config.text}>{index + 1}</span>
                      ) : null}
                    </button>

                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className={cn(
                          isHorizontal
                            ? cn(
                                'hidden sm:flex flex-1 min-w-8',
                                config.connector.h
                              )
                            : cn('flex-1 min-h-8', config.connector.w),
                          'mt-1',
                          status === 'completed'
                            ? 'bg-green-500/50'
                            : 'bg-white/10'
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  {/* Label and description */}
                  <div
                    className={cn(
                      isHorizontal ? 'text-center mt-2' : 'ml-3',
                      'flex flex-col'
                    )}
                  >
                    <span
                      className={cn(
                        config.text,
                        'font-medium',
                        status === 'current' && 'text-white',
                        status === 'completed' && 'text-white/80',
                        status === 'upcoming' && 'text-white/50',
                        status === 'error' && 'text-red-400'
                      )}
                    >
                      {step.label}
                      {step.optional && (
                        <span className="ml-1 text-white/40 font-normal">
                          (optional)
                        </span>
                      )}
                    </span>
                    {step.description && (
                      <span
                        className={cn(
                          config.descText,
                          'text-white/40 mt-0.5'
                        )}
                      >
                        {step.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Horizontal connector (between items) */}
                {!isLast && isHorizontal && (
                  <div
                    className={cn(
                      'flex-1 min-w-4 mt-4',
                      config.connector.h,
                      status === 'completed' ? 'bg-green-500/50' : 'bg-white/10'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';
