/**
 * FocusScope Component
 *
 * Manages focus within a scope with auto-focus and focus restoration.
 * Lighter than FocusTrap - doesn't prevent focus from leaving,
 * but manages initial focus and restoration.
 *
 * @example
 * ```tsx
 * <FocusScope autoFocus restoreFocus>
 *   <SearchInput />
 *   <ResultsList />
 * </FocusScope>
 * ```
 */

import React, { useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { FOCUSABLE_SELECTORS, type FocusScopeOptions } from './types';

/** Focus scope context for nested scopes */
interface FocusScopeContextValue {
  /** Register a child scope */
  registerScope: (id: string) => void;
  /** Unregister a child scope */
  unregisterScope: (id: string) => void;
  /** Parent scope id */
  parentId: string | null;
}

const FocusScopeContext = createContext<FocusScopeContextValue | null>(null);

let scopeIdCounter = 0;

export interface FocusScopeProps extends FocusScopeOptions {
  children: React.ReactNode;
  /** Element type for the container */
  as?: keyof JSX.IntrinsicElements;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Custom element to focus initially */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * Get first focusable element in container
 */
function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
  for (const el of elements) {
    if (el.offsetParent !== null || el.style.position === 'fixed') {
      const style = window.getComputedStyle(el);
      if (style.visibility !== 'hidden' && style.display !== 'none') {
        return el;
      }
    }
  }
  return null;
}

export const FocusScope = React.forwardRef<HTMLDivElement, FocusScopeProps>(
  (
    {
      children,
      as: Component = 'div',
      className,
      style,
      autoFocus = false,
      restoreFocus = false,
      contain = false,
      initialFocusRef,
    },
    forwardedRef
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const scopeId = useRef(`focus-scope-${++scopeIdCounter}`);
    const childScopes = useRef<Set<string>>(new Set());

    const ref = (forwardedRef as React.RefObject<HTMLDivElement>) || containerRef;
    const parentContext = useContext(FocusScopeContext);

    // Register with parent scope
    useEffect(() => {
      if (parentContext) {
        parentContext.registerScope(scopeId.current);
        return () => {
          parentContext.unregisterScope(scopeId.current);
        };
      }
    }, [parentContext]);

    // Store previously focused element
    useEffect(() => {
      if (restoreFocus) {
        previousActiveElement.current = document.activeElement as HTMLElement;
      }
    }, [restoreFocus]);

    // Auto-focus first element or custom element
    useEffect(() => {
      if (!autoFocus || !ref.current) return;

      const focusElement = () => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
          return;
        }

        const firstFocusable = getFirstFocusable(ref.current!);
        if (firstFocusable) {
          firstFocusable.focus();
        }
      };

      // Delay to ensure DOM is ready
      requestAnimationFrame(focusElement);
    }, [autoFocus, initialFocusRef, ref]);

    // Restore focus on unmount
    useEffect(() => {
      return () => {
        if (restoreFocus && previousActiveElement.current) {
          // Delay to allow cleanup
          requestAnimationFrame(() => {
            if (
              previousActiveElement.current &&
              typeof previousActiveElement.current.focus === 'function'
            ) {
              previousActiveElement.current.focus();
            }
          });
        }
      };
    }, [restoreFocus]);

    // Optional focus containment (lighter than FocusTrap)
    useEffect(() => {
      if (!contain) return;

      const handleFocusOut = (event: FocusEvent) => {
        if (!ref.current) return;

        const relatedTarget = event.relatedTarget as HTMLElement | null;

        // If focus is leaving the scope entirely
        if (relatedTarget && !ref.current.contains(relatedTarget)) {
          // Check if it's going to a child scope
          const isChildScope = Array.from(childScopes.current).some((id) => {
            const scopeEl = document.getElementById(id);
            return scopeEl?.contains(relatedTarget);
          });

          if (!isChildScope) {
            event.preventDefault();
            const firstFocusable = getFirstFocusable(ref.current);
            firstFocusable?.focus();
          }
        }
      };

      ref.current?.addEventListener('focusout', handleFocusOut);
      return () => {
        ref.current?.removeEventListener('focusout', handleFocusOut);
      };
    }, [contain, ref]);

    const contextValue: FocusScopeContextValue = {
      registerScope: useCallback((id: string) => {
        childScopes.current.add(id);
      }, []),
      unregisterScope: useCallback((id: string) => {
        childScopes.current.delete(id);
      }, []),
      parentId: scopeId.current,
    };

    return (
      <FocusScopeContext.Provider value={contextValue}>
        {React.createElement(
          Component,
          {
            ref,
            id: scopeId.current,
            className,
            style,
          },
          children
        )}
      </FocusScopeContext.Provider>
    );
  }
);

FocusScope.displayName = 'FocusScope';

/**
 * useFocusScope Hook
 *
 * Access focus scope context for programmatic control.
 */
export function useFocusScope() {
  return useContext(FocusScopeContext);
}
