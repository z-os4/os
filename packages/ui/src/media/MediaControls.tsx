/**
 * MediaControls Components
 *
 * Shared control components for media players with glass styling.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  PlayButtonProps,
  VolumeControlProps,
  ProgressBarProps,
  TimeDisplayProps,
  FullscreenButtonProps,
  PlaybackSpeedControlProps,
} from './types';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Glass Styles (shared)
// ============================================================================

const glassButtonStyles = cn(
  'flex items-center justify-center rounded-full',
  'bg-white/10 backdrop-blur-sm',
  'hover:bg-white/20 active:bg-white/30',
  'transition-colors duration-150',
  'disabled:opacity-50 disabled:cursor-not-allowed'
);

const glassSliderStyles = cn(
  'appearance-none bg-white/20 rounded-full cursor-pointer',
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:bg-white',
  '[&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:cursor-pointer',
  '[&::-webkit-slider-thumb]:transition-transform',
  '[&::-webkit-slider-thumb]:hover:scale-110',
  '[&::-moz-range-thumb]:bg-white',
  '[&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-0',
  '[&::-moz-range-thumb]:cursor-pointer'
);

// ============================================================================
// PlayButton
// ============================================================================

export const PlayButton: React.FC<PlayButtonProps> = ({
  playing,
  onClick,
  disabled = false,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 [&_svg]:w-4 [&_svg]:h-4',
    md: 'w-12 h-12 [&_svg]:w-6 [&_svg]:h-6',
    lg: 'w-16 h-16 [&_svg]:w-8 [&_svg]:h-8',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(glassButtonStyles, sizeClasses[size], className)}
      aria-label={playing ? 'Pause' : 'Play'}
    >
      {playing ? (
        <Pause className="text-white" />
      ) : (
        <Play className="text-white ml-0.5" fill="currentColor" />
      )}
    </button>
  );
};

// ============================================================================
// VolumeControl
// ============================================================================

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  muted,
  onChange,
  onMuteToggle,
  disabled = false,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const effectiveVolume = muted ? 0 : volume;

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={onMuteToggle}
        disabled={disabled}
        className={cn(glassButtonStyles, 'w-8 h-8')}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="w-4 h-4 text-white" />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isHovered ? 'w-20 opacity-100' : 'w-0 opacity-0'
        )}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={effectiveVolume}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            glassSliderStyles,
            'w-20 h-1',
            '[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3'
          )}
          style={{
            background: `linear-gradient(to right, white ${effectiveVolume * 100}%, rgba(255,255,255,0.2) ${effectiveVolume * 100}%)`,
          }}
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

// ============================================================================
// ProgressBar
// ============================================================================

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  duration,
  onSeek,
  buffered,
  disabled = false,
  className,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  // Calculate buffered percentage
  const bufferedPercent = (() => {
    if (!buffered || buffered.length === 0) return 0;
    const end = buffered.end(buffered.length - 1);
    return duration > 0 ? (end / duration) * 100 : 0;
  })();

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      if (!barRef.current || !duration) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      return percent * duration;
    },
    [duration]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      const time = getTimeFromPosition(e.clientX);
      onSeek(time);
    },
    [disabled, getTimeFromPosition, onSeek]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      setHoverX(e.clientX - rect.left);
      setHoverTime(getTimeFromPosition(e.clientX));

      if (isDragging) {
        onSeek(getTimeFromPosition(e.clientX));
      }
    },
    [isDragging, getTimeFromPosition, onSeek]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      onSeek(getTimeFromPosition(e.clientX));
    },
    [disabled, getTimeFromPosition, onSeek]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromPosition(e.clientX);
      onSeek(time);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, getTimeFromPosition, onSeek]);

  return (
    <div className={cn('relative group', className)}>
      {/* Hover time tooltip */}
      {hoverTime !== null && !isDragging && (
        <div
          className="absolute -top-8 transform -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap pointer-events-none"
          style={{ left: hoverX }}
        >
          {formatTime(hoverTime)}
        </div>
      )}

      <div
        ref={barRef}
        className={cn(
          'relative h-1 bg-white/20 rounded-full cursor-pointer group-hover:h-1.5 transition-all',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
      >
        {/* Buffered bar */}
        <div
          className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
          style={{ width: `${bufferedPercent}%` }}
        />

        {/* Progress bar */}
        <div
          className="absolute inset-y-0 left-0 bg-white rounded-full"
          style={{ width: `${progress}%` }}
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'shadow-md'
          )}
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// TimeDisplay
// ============================================================================

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  current,
  duration,
  showRemaining = false,
  className,
}) => {
  const displayTime = showRemaining ? duration - current : current;
  const prefix = showRemaining ? '-' : '';

  return (
    <span className={cn('text-sm text-white/80 tabular-nums font-mono', className)}>
      {prefix}{formatTime(displayTime)} / {formatTime(duration)}
    </span>
  );
};

// ============================================================================
// FullscreenButton
// ============================================================================

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  fullscreen,
  onClick,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(glassButtonStyles, 'w-8 h-8', className)}
      aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {fullscreen ? (
        <Minimize className="w-4 h-4 text-white" />
      ) : (
        <Maximize className="w-4 h-4 text-white" />
      )}
    </button>
  );
};

// ============================================================================
// PlaybackSpeedControl
// ============================================================================

export const PlaybackSpeedControl: React.FC<PlaybackSpeedControlProps> = ({
  speed,
  onChange,
  speeds = [0.5, 0.75, 1, 1.25, 1.5, 2],
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          glassButtonStyles,
          'px-2 h-8 text-xs font-medium text-white'
        )}
        aria-label="Playback speed"
      >
        {speed}x
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 py-1 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setIsOpen(false);
              }}
              className={cn(
                'block w-full px-4 py-1.5 text-sm text-white/80 hover:bg-white/10 text-left',
                s === speed && 'text-white bg-white/10'
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ControlsOverlay (wrapper for video controls)
// ============================================================================

export interface ControlsOverlayProps {
  visible: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  visible,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0',
        'bg-gradient-to-t from-black/80 via-black/40 to-transparent',
        'p-4 pt-12',
        'transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  );
};

export default {
  PlayButton,
  VolumeControl,
  ProgressBar,
  TimeDisplay,
  FullscreenButton,
  PlaybackSpeedControl,
  ControlsOverlay,
  formatTime,
};
