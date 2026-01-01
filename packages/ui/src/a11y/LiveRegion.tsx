/**
 * LiveRegion Component
 *
 * ARIA live regions for announcing dynamic content to screen readers.
 * Supports polite (waits for pause) and assertive (interrupts) modes.
 *
 * @example
 * ```tsx
 * <LiveRegion priority="polite">
 *   {status}
 * </LiveRegion>
 *
 * // Or with hook
 * const { announce } = useAnnounce();
 * announce('File saved successfully', 'assertive');
 * ```
 */

import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import type { AnnouncementPriority } from './types';
import { VisuallyHidden } from './VisuallyHidden';

/** Message in the announcement queue */
interface Announcement {
  id: string;
  message: string;
  priority: AnnouncementPriority;
  timestamp: number;
}

/** Announce context type */
interface AnnounceContextValue {
  announce: (message: string, priority?: AnnouncementPriority) => void;
  clearAnnouncements: () => void;
}

const AnnounceContext = createContext<AnnounceContextValue | null>(null);

/**
 * LiveRegion Provider - Manages announcement queue
 *
 * Place this near the root of your app to enable announcements.
 */
export interface LiveRegionProviderProps {
  children: React.ReactNode;
  /** Delay between announcements in ms */
  debounceDelay?: number;
}

export const LiveRegionProvider: React.FC<LiveRegionProviderProps> = ({
  children,
  debounceDelay = 150,
}) => {
  const [politeMessages, setPoliteMessages] = useState<string[]>([]);
  const [assertiveMessages, setAssertiveMessages] = useState<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const idCounter = useRef(0);

  const announce = useCallback(
    (message: string, priority: AnnouncementPriority = 'polite') => {
      if (!message.trim()) return;

      // Clear pending timeout to debounce rapid announcements
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (priority === 'assertive') {
          setAssertiveMessages((prev) => [...prev, message]);
        } else {
          setPoliteMessages((prev) => [...prev, message]);
        }

        // Clear messages after they're announced
        setTimeout(() => {
          if (priority === 'assertive') {
            setAssertiveMessages((prev) => prev.filter((m) => m !== message));
          } else {
            setPoliteMessages((prev) => prev.filter((m) => m !== message));
          }
        }, 1000);
      }, debounceDelay);
    },
    [debounceDelay]
  );

  const clearAnnouncements = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setPoliteMessages([]);
    setAssertiveMessages([]);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <AnnounceContext.Provider value={{ announce, clearAnnouncements }}>
      {children}
      {/* Polite live region */}
      <VisuallyHidden
        as="div"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {politeMessages.join('. ')}
      </VisuallyHidden>
      {/* Assertive live region */}
      <VisuallyHidden
        as="div"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {assertiveMessages.join('. ')}
      </VisuallyHidden>
    </AnnounceContext.Provider>
  );
};

LiveRegionProvider.displayName = 'LiveRegionProvider';

/**
 * useAnnounce Hook
 *
 * Access the announce function to make screen reader announcements.
 *
 * @example
 * ```tsx
 * const { announce } = useAnnounce();
 *
 * const handleSave = async () => {
 *   await save();
 *   announce('Document saved');
 * };
 *
 * const handleError = (error: Error) => {
 *   announce(`Error: ${error.message}`, 'assertive');
 * };
 * ```
 */
export function useAnnounce(): AnnounceContextValue {
  const context = useContext(AnnounceContext);

  if (!context) {
    // Fallback for when provider is not present
    return {
      announce: (message: string, priority?: AnnouncementPriority) => {
        console.warn(
          '[useAnnounce] LiveRegionProvider not found. Message not announced:',
          message
        );
      },
      clearAnnouncements: () => {},
    };
  }

  return context;
}

/**
 * LiveRegion Component
 *
 * Inline live region for specific dynamic content.
 *
 * @example
 * ```tsx
 * <LiveRegion priority="polite">
 *   {itemCount} items in cart
 * </LiveRegion>
 * ```
 */
export interface LiveRegionProps {
  children: React.ReactNode;
  /** Announcement priority */
  priority?: AnnouncementPriority;
  /** Additional ARIA role */
  role?: 'status' | 'alert' | 'log' | 'timer';
  /** Whether to announce entire region on updates */
  atomic?: boolean;
  /** Which parts to announce: 'additions' | 'removals' | 'text' | 'all' */
  relevant?: string;
  /** Visually hide the region */
  visuallyHidden?: boolean;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  priority = 'polite',
  role = priority === 'assertive' ? 'alert' : 'status',
  atomic = true,
  relevant = 'additions text',
  visuallyHidden = true,
}) => {
  const content = (
    <div
      role={role}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant as 'additions' | 'removals' | 'text' | 'all'}
    >
      {children}
    </div>
  );

  if (visuallyHidden) {
    return <VisuallyHidden as="div">{content}</VisuallyHidden>;
  }

  return content;
};

LiveRegion.displayName = 'LiveRegion';
