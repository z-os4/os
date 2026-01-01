/**
 * Dialog Component
 *
 * Base dialog component with glass morphism styling matching zOS theme.
 * Uses CSS transitions for scale + fade animation.
 * Supports focus trap, ESC key handling, and portal rendering.
 *
 * @example
 * ```tsx
 * <Dialog id="settings" open={isOpen} onClose={() => setIsOpen(false)} title="Settings">
 *   <p>Dialog content here</p>
 * </Dialog>
 * ```
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import { FocusTrap } from '../a11y/FocusTrap';
import { Z_INDEX } from '../constants';
import type { DialogProps } from './types';
import { DIALOG_SIZE_CLASSES } from './types';

/** Close button icon (X) */
const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M1 1L13 13M13 1L1 13" />
  </svg>
);

export function Dialog({
  id,
  open,
  onClose,
  title,
  size = 'md',
  closable = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  children,
  className,
}: DialogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle open/close with animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle ESC key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdrop && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  if (!isVisible) return null;

  const isFullscreen = size === 'fullscreen';

  const dialog = (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center',
        'transition-opacity duration-200 ease-out',
        isAnimating ? 'opacity-100' : 'opacity-0'
      )}
      style={{ zIndex: Z_INDEX.DIALOG }}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-200',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <FocusTrap active={open}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? `${id}-title` : undefined}
          className={cn(
            'relative w-full',
            DIALOG_SIZE_CLASSES[size],
            !isFullscreen && 'mx-4',
            // Glass morphism styling
            'bg-black/80 backdrop-blur-xl',
            'border border-white/10',
            !isFullscreen && 'rounded-xl',
            'shadow-2xl shadow-black/50',
            // Animation
            'transition-all duration-200 ease-out',
            isAnimating
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2',
            className
          )}
        >
          {/* Header */}
          {(title || closable) && (
            <div
              className={cn(
                'flex items-center justify-between',
                'px-4 py-3',
                'border-b border-white/10'
              )}
            >
              {title && (
                <h2
                  id={`${id}-title`}
                  className="text-sm font-medium text-white"
                >
                  {title}
                </h2>
              )}
              {closable && (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-center',
                    'w-6 h-6 rounded-md',
                    'text-white/50 hover:text-white hover:bg-white/10',
                    'transition-colors',
                    !title && 'ml-auto'
                  )}
                  aria-label="Close dialog"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={cn('p-4', isFullscreen && 'h-full overflow-auto')}>
            {children}
          </div>
        </div>
      </FocusTrap>
    </div>
  );

  // Render in portal
  if (typeof document === 'undefined') return null;
  return createPortal(dialog, document.body);
}

Dialog.displayName = 'Dialog';
