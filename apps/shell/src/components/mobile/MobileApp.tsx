/**
 * Mobile App Container
 *
 * Full-screen app wrapper for mobile devices.
 * Provides gestures for going back to home.
 */

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@z-os/ui';

interface MobileAppProps {
  children: React.ReactNode;
  appName: string;
  onClose: () => void;
  /** Whether to show the navigation bar */
  showNavBar?: boolean;
  /** App accent color */
  accentColor?: string;
}

export const MobileApp: React.FC<MobileAppProps> = ({
  children,
  appName,
  onClose,
  showNavBar = true,
  accentColor = '#007AFF',
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe up from bottom to go home
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    // Only track if starting from bottom 50px
    if (window.innerHeight - touch.clientY < 50) {
      touchStartY.current = touch.clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const touch = e.touches[0];
    const delta = touchStartY.current - touch.clientY;
    const progress = Math.min(Math.max(delta / 200, 0), 1);
    setSwipeProgress(progress);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (swipeProgress > 0.5) {
      setIsClosing(true);
      setTimeout(onClose, 300);
    } else {
      setSwipeProgress(0);
    }
    touchStartY.current = null;
  }, [swipeProgress, onClose]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-50 bg-black",
        "transition-all duration-300 ease-out",
        isClosing && "opacity-0 scale-95"
      )}
      style={{
        transform: swipeProgress > 0 ? `scale(${1 - swipeProgress * 0.1})` : undefined,
        borderRadius: swipeProgress > 0 ? `${swipeProgress * 40}px` : undefined,
        opacity: swipeProgress > 0 ? 1 - swipeProgress * 0.3 : undefined,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-50 bg-black/50 backdrop-blur-lg">
        <div className="text-white text-sm font-semibold">
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
        <div className="text-white text-sm font-medium">{appName}</div>
        <div className="flex items-center gap-1.5">
          <BatteryIcon />
        </div>
      </div>

      {/* App Content */}
      <div className="absolute inset-0 pt-12 pb-20">
        {children}
      </div>

      {/* Navigation Bar */}
      {showNavBar && (
        <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center justify-center bg-black/50 backdrop-blur-lg">
          <button
            onClick={handleClose}
            className="flex flex-col items-center gap-1 px-8 py-2"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-white/70 text-xs">Home</span>
          </button>
        </div>
      )}

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-32 h-1 bg-white/50 rounded-full" />
      </div>
    </div>
  );
};

const BatteryIcon: React.FC = () => (
  <svg className="w-6 h-4 text-white" viewBox="0 0 25 12" fill="currentColor">
    <rect x="0" y="0" width="22" height="12" rx="3" stroke="currentColor" strokeWidth="1" fill="none"/>
    <rect x="23" y="3" width="2" height="6" rx="1"/>
    <rect x="2" y="2" width="18" height="8" rx="1"/>
  </svg>
);

export default MobileApp;
