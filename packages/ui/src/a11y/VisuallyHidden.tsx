/**
 * VisuallyHidden Component
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Use for skip links, form labels, and descriptive text that should
 * only be read by assistive technologies.
 *
 * @example
 * ```tsx
 * <button>
 *   <Icon name="close" />
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 * </button>
 * ```
 */

import React from 'react';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to hide visually */
  children: React.ReactNode;
  /** Render as a different element */
  as?: keyof JSX.IntrinsicElements;
  /** When true, content becomes visible (useful for focus states) */
  focusable?: boolean;
}

/**
 * CSS that hides content visually but keeps it accessible.
 * This technique is WCAG-compliant and works across all screen readers.
 */
const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Styles when element is focused (for focusable variant)
 */
const focusableStyles: React.CSSProperties = {
  position: 'static',
  width: 'auto',
  height: 'auto',
  padding: 'inherit',
  margin: 'inherit',
  overflow: 'visible',
  clip: 'auto',
  whiteSpace: 'normal',
};

export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ children, as: Component = 'span', focusable = false, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLSpanElement>) => {
        if (focusable) setIsFocused(true);
        props.onFocus?.(e);
      },
      [focusable, props]
    );

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLSpanElement>) => {
        if (focusable) setIsFocused(false);
        props.onBlur?.(e);
      },
      [focusable, props]
    );

    const computedStyle =
      focusable && isFocused
        ? { ...style, ...focusableStyles }
        : { ...visuallyHiddenStyles, ...style };

    return React.createElement(
      Component,
      {
        ref,
        style: computedStyle,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ...props,
      },
      children
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';
