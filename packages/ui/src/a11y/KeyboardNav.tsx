/**
 * KeyboardNav Component
 *
 * Manages keyboard navigation within a container.
 * Supports arrow keys, Home/End, and configurable behavior.
 *
 * @example
 * ```tsx
 * <KeyboardNav as="ul" selector="li" direction="vertical">
 *   {items.map(item => (
 *     <li key={item.id} tabIndex={-1}>{item.name}</li>
 *   ))}
 * </KeyboardNav>
 *
 * // Grid navigation
 * <KeyboardNav direction="grid" columns={3} selector="button">
 *   {items.map(item => (
 *     <button key={item.id}>{item.name}</button>
 *   ))}
 * </KeyboardNav>
 * ```
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { NavigationDirection, KeyboardNavOptions } from './types';

export interface KeyboardNavProps extends KeyboardNavOptions {
  children: React.ReactNode;
  /** Element type for the container */
  as?: keyof JSX.IntrinsicElements;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Number of columns for grid navigation */
  columns?: number;
  /** ARIA role for the container */
  role?: string;
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA labelledby */
  'aria-labelledby'?: string;
}

/**
 * Get navigable elements within container
 */
function getNavigableElements(container: HTMLElement, selector: string): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(selector);
  return Array.from(elements).filter((el) => {
    // Filter out disabled elements
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    // Filter out hidden elements
    if (el.offsetParent === null && el.style.position !== 'fixed') {
      return false;
    }
    return true;
  });
}

export const KeyboardNav = React.forwardRef<HTMLElement, KeyboardNavProps>(
  (
    {
      children,
      as: Component = 'div',
      className,
      style,
      direction = 'vertical',
      selector = '[tabindex], button, a, input, select, textarea',
      loop = true,
      initialIndex = 0,
      onIndexChange,
      onSelect,
      columns = 1,
      role,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    forwardedRef
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const ref = (forwardedRef as React.RefObject<HTMLElement>) || containerRef;

    // Focus element at index
    const focusIndex = useCallback(
      (index: number, elements: HTMLElement[]) => {
        if (index >= 0 && index < elements.length) {
          elements[index].focus();
          setCurrentIndex(index);
          onIndexChange?.(index);
        }
      },
      [onIndexChange]
    );

    // Calculate next index based on direction
    const getNextIndex = useCallback(
      (
        current: number,
        total: number,
        key: string
      ): number => {
        let next = current;

        switch (direction) {
          case 'horizontal':
            if (key === 'ArrowRight') next = current + 1;
            if (key === 'ArrowLeft') next = current - 1;
            break;

          case 'vertical':
            if (key === 'ArrowDown') next = current + 1;
            if (key === 'ArrowUp') next = current - 1;
            break;

          case 'both':
            if (key === 'ArrowRight' || key === 'ArrowDown') next = current + 1;
            if (key === 'ArrowLeft' || key === 'ArrowUp') next = current - 1;
            break;

          case 'grid':
            if (key === 'ArrowRight') next = current + 1;
            if (key === 'ArrowLeft') next = current - 1;
            if (key === 'ArrowDown') next = current + columns;
            if (key === 'ArrowUp') next = current - columns;
            break;
        }

        // Handle Home/End keys
        if (key === 'Home') next = 0;
        if (key === 'End') next = total - 1;

        // Handle looping
        if (loop) {
          if (next < 0) next = total - 1;
          if (next >= total) next = 0;
        } else {
          next = Math.max(0, Math.min(next, total - 1));
        }

        return next;
      },
      [direction, columns, loop]
    );

    // Handle keyboard events
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (!ref.current) return;

        const elements = getNavigableElements(ref.current, selector);
        if (elements.length === 0) return;

        const navigationKeys = [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End',
        ];

        if (navigationKeys.includes(event.key)) {
          event.preventDefault();

          // Find current focused element index
          const focusedElement = document.activeElement as HTMLElement;
          const focusedIndex = elements.indexOf(focusedElement);
          const current = focusedIndex >= 0 ? focusedIndex : currentIndex;

          const nextIndex = getNextIndex(current, elements.length, event.key);
          focusIndex(nextIndex, elements);
        }

        // Handle selection with Enter or Space
        if (event.key === 'Enter' || event.key === ' ') {
          const focusedElement = document.activeElement as HTMLElement;
          const focusedIndex = elements.indexOf(focusedElement);

          if (focusedIndex >= 0) {
            // Don't prevent default for buttons/links - let them handle it
            const tagName = focusedElement.tagName.toLowerCase();
            if (tagName !== 'button' && tagName !== 'a') {
              event.preventDefault();
            }
            onSelect?.(focusedIndex, focusedElement);
          }
        }
      },
      [ref, selector, currentIndex, getNextIndex, focusIndex, onSelect]
    );

    // Handle focus to track current index
    const handleFocus = useCallback(
      (event: React.FocusEvent) => {
        if (!ref.current) return;

        const target = event.target as HTMLElement;
        const elements = getNavigableElements(ref.current, selector);
        const index = elements.indexOf(target);

        if (index >= 0 && index !== currentIndex) {
          setCurrentIndex(index);
          onIndexChange?.(index);
        }
      },
      [ref, selector, currentIndex, onIndexChange]
    );

    // Set initial tabindex on mount
    useEffect(() => {
      if (!ref.current) return;

      const elements = getNavigableElements(ref.current, selector);

      // Make all elements focusable but only first tabbable
      elements.forEach((el, i) => {
        if (!el.hasAttribute('tabindex')) {
          el.setAttribute('tabindex', i === initialIndex ? '0' : '-1');
        }
      });
    }, [ref, selector, initialIndex]);

    // Update tabindex when current index changes
    useEffect(() => {
      if (!ref.current) return;

      const elements = getNavigableElements(ref.current, selector);

      elements.forEach((el, i) => {
        el.setAttribute('tabindex', i === currentIndex ? '0' : '-1');
      });
    }, [ref, selector, currentIndex]);

    return React.createElement(
      Component,
      {
        ref,
        className,
        style,
        role,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledBy,
        onKeyDown: handleKeyDown,
        onFocus: handleFocus,
      },
      children
    );
  }
);

KeyboardNav.displayName = 'KeyboardNav';

/**
 * useKeyboardNavigation Hook
 *
 * Imperative hook for keyboard navigation.
 *
 * @example
 * ```tsx
 * const { containerProps, focusIndex, currentIndex } = useKeyboardNavigation({
 *   direction: 'vertical',
 *   selector: 'li',
 * });
 *
 * <ul {...containerProps}>
 *   {items.map((item, i) => (
 *     <li key={item.id} tabIndex={i === currentIndex ? 0 : -1}>
 *       {item.name}
 *     </li>
 *   ))}
 * </ul>
 * ```
 */
export function useKeyboardNavigation(options: KeyboardNavOptions & { columns?: number } = {}) {
  const {
    direction = 'vertical',
    selector = '[tabindex], button, a',
    loop = true,
    initialIndex = 0,
    onIndexChange,
    onSelect,
    columns = 1,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const getNextIndex = useCallback(
    (current: number, total: number, key: string): number => {
      let next = current;

      switch (direction) {
        case 'horizontal':
          if (key === 'ArrowRight') next = current + 1;
          if (key === 'ArrowLeft') next = current - 1;
          break;
        case 'vertical':
          if (key === 'ArrowDown') next = current + 1;
          if (key === 'ArrowUp') next = current - 1;
          break;
        case 'both':
          if (key === 'ArrowRight' || key === 'ArrowDown') next = current + 1;
          if (key === 'ArrowLeft' || key === 'ArrowUp') next = current - 1;
          break;
        case 'grid':
          if (key === 'ArrowRight') next = current + 1;
          if (key === 'ArrowLeft') next = current - 1;
          if (key === 'ArrowDown') next = current + columns;
          if (key === 'ArrowUp') next = current - columns;
          break;
      }

      if (key === 'Home') next = 0;
      if (key === 'End') next = total - 1;

      if (loop) {
        if (next < 0) next = total - 1;
        if (next >= total) next = 0;
      } else {
        next = Math.max(0, Math.min(next, total - 1));
      }

      return next;
    },
    [direction, columns, loop]
  );

  const focusIndex = useCallback(
    (index: number) => {
      if (!containerRef.current) return;

      const elements = getNavigableElements(containerRef.current, selector);
      if (index >= 0 && index < elements.length) {
        elements[index].focus();
        setCurrentIndex(index);
        onIndexChange?.(index);
      }
    },
    [selector, onIndexChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!containerRef.current) return;

      const elements = getNavigableElements(containerRef.current, selector);
      if (elements.length === 0) return;

      const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

      if (navigationKeys.includes(event.key)) {
        event.preventDefault();
        const nextIndex = getNextIndex(currentIndex, elements.length, event.key);
        focusIndex(nextIndex);
      }

      if (event.key === 'Enter' || event.key === ' ') {
        const elements = getNavigableElements(containerRef.current, selector);
        if (currentIndex >= 0 && currentIndex < elements.length) {
          onSelect?.(currentIndex, elements[currentIndex]);
        }
      }
    },
    [selector, currentIndex, getNextIndex, focusIndex, onSelect]
  );

  return {
    containerRef,
    containerProps: {
      ref: containerRef,
      onKeyDown: handleKeyDown,
    },
    currentIndex,
    setCurrentIndex,
    focusIndex,
  };
}
