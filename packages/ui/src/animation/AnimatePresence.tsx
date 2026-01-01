/**
 * AnimatePresence Component
 *
 * Manages exit animations for dynamically added/removed list items.
 */

'use client';

import React, {
  Children,
  cloneElement,
  isValidElement,
  useRef,
  useState,
  useEffect,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '../a11y';

export interface AnimatePresenceProps {
  /** Children to animate */
  children: ReactNode;
  /** Whether to wait for exit animation before entering new elements. Default: false */
  exitBeforeEnter?: boolean;
  /** Whether to animate initial children on mount. Default: true */
  initial?: boolean;
  /** Exit duration in milliseconds. Default: 200 */
  exitDuration?: number;
  /** Callback when an item finishes exiting */
  onExitComplete?: () => void;
}

interface PresenceChild {
  element: ReactElement;
  key: string | number;
  isExiting: boolean;
}

/**
 * Get a stable key from a React element.
 */
function getChildKey(child: ReactElement, index: number): string | number {
  return child.key ?? index;
}

/**
 * AnimatePresence enables exit animations for removed children.
 *
 * Children must accept `data-exiting` prop and handle their own exit animation.
 *
 * @example
 * <AnimatePresence>
 *   {items.map(item => (
 *     <Fade key={item.id} show={true}>
 *       <div>{item.name}</div>
 *     </Fade>
 *   ))}
 * </AnimatePresence>
 */
export function AnimatePresence({
  children,
  exitBeforeEnter = false,
  initial = true,
  exitDuration = 200,
  onExitComplete,
}: AnimatePresenceProps): ReactElement {
  const prefersReducedMotion = useReducedMotion();
  const effectiveDuration = prefersReducedMotion ? 0 : exitDuration;

  const [presenceChildren, setPresenceChildren] = useState<PresenceChild[]>(() => {
    const childArray = Children.toArray(children);
    return childArray
      .filter(isValidElement)
      .map((element, index) => ({
        element,
        key: getChildKey(element, index),
        isExiting: false,
      }));
  });

  const isInitialMount = useRef(true);
  const exitingKeys = useRef<Set<string | number>>(new Set());
  const exitTimeouts = useRef<Map<string | number, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      exitTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  useEffect(() => {
    const newChildArray = Children.toArray(children).filter(isValidElement);
    const newKeys = new Set(newChildArray.map((child, index) => getChildKey(child, index)));

    // Skip animation on initial mount if initial is false
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!initial) {
        setPresenceChildren(
          newChildArray.map((element, index) => ({
            element,
            key: getChildKey(element, index),
            isExiting: false,
          }))
        );
        return;
      }
    }

    setPresenceChildren((prev) => {
      const result: PresenceChild[] = [];
      const seenKeys = new Set<string | number>();

      // Process existing children
      for (const child of prev) {
        if (newKeys.has(child.key)) {
          // Update existing child
          const newChild = newChildArray.find(
            (c, i) => getChildKey(c, i) === child.key
          );
          if (newChild) {
            result.push({
              element: newChild,
              key: child.key,
              isExiting: false,
            });
            seenKeys.add(child.key);
          }
        } else if (!exitingKeys.current.has(child.key)) {
          // Child was removed, mark as exiting
          exitingKeys.current.add(child.key);
          result.push({
            ...child,
            isExiting: true,
          });

          // Schedule removal
          const timeout = setTimeout(() => {
            exitingKeys.current.delete(child.key);
            exitTimeouts.current.delete(child.key);
            setPresenceChildren((current) =>
              current.filter((c) => c.key !== child.key)
            );
            onExitComplete?.();
          }, effectiveDuration);

          exitTimeouts.current.set(child.key, timeout);
        } else {
          // Already exiting, keep it
          result.push(child);
        }
      }

      // Add new children
      for (let i = 0; i < newChildArray.length; i++) {
        const child = newChildArray[i];
        const key = getChildKey(child, i);
        if (!seenKeys.has(key)) {
          // If exitBeforeEnter, delay adding new children until exits complete
          if (exitBeforeEnter && exitingKeys.current.size > 0) {
            // Will be added after exits complete
            continue;
          }
          result.push({
            element: child,
            key,
            isExiting: false,
          });
        }
      }

      return result;
    });
  }, [children, initial, effectiveDuration, exitBeforeEnter, onExitComplete]);

  return (
    <>
      {presenceChildren.map(({ element, key, isExiting }) => {
        // Pass exiting state to child via data attribute or prop
        return cloneElement(element, {
          key,
          'data-exiting': isExiting || undefined,
          // If child is a Transition-based component, set show to false when exiting
          ...(isExiting && 'show' in element.props ? { show: false } : {}),
        });
      })}
    </>
  );
}
