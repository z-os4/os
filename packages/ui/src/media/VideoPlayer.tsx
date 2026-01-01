/**
 * VideoPlayer Component
 *
 * Custom video player with glass-styled controls overlay.
 * Supports multiple sources, picture-in-picture, and playback speed.
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  PictureInPicture2,
  Settings,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useMediaControls } from './useMediaControls';
import {
  PlayButton,
  VolumeControl,
  ProgressBar,
  TimeDisplay,
  FullscreenButton,
  PlaybackSpeedControl,
  ControlsOverlay,
} from './MediaControls';
import type { VideoPlayerProps, MediaSource } from './types';

// ============================================================================
// Constants
// ============================================================================

const CONTROLS_HIDE_DELAY = 3000;
const SKIP_SECONDS = 10;

// ============================================================================
// Component
// ============================================================================

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onDurationChange,
  onError,
  className,
}: VideoPlayerProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Media controls hook
  const mediaControls = useMediaControls(videoRef, {
    initialMuted: muted,
    autoPlay,
    onPlay: () => {
      setHasStarted(true);
      onPlay?.();
    },
    onPause,
    onEnded,
    onTimeUpdate,
    onDurationChange,
    onError,
  });

  const {
    playing,
    currentTime,
    duration,
    volume,
    muted: isMuted,
    loading,
    error,
    buffered,
    playbackRate,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
  } = mediaControls;

  // Normalize sources
  const sources = useMemo((): MediaSource[] => {
    if (typeof src === 'string') {
      return [{ src }];
    }
    return src;
  }, [src]);

  // Show/hide controls logic
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_DELAY);
    }
  }, [playing]);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handleMouseLeave = useCallback(() => {
    if (playing) {
      setShowControls(false);
    }
  }, [playing]);

  // Keep controls visible when paused
  useEffect(() => {
    if (!playing) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [playing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Skip handlers
  const skipBackward = useCallback(() => {
    seek(Math.max(0, currentTime - SKIP_SECONDS));
  }, [seek, currentTime]);

  const skipForward = useCallback(() => {
    seek(Math.min(duration, currentTime + SKIP_SECONDS));
  }, [seek, currentTime, duration]);

  // Fullscreen handling
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch {
      // Fullscreen request failed
    }
  }, []);

  // Picture-in-Picture handling
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch {
      // PiP request failed
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if container is focused
      if (!container.contains(document.activeElement) && document.activeElement !== container) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          toggle();
          showControlsTemporarily();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          skipBackward();
          showControlsTemporarily();
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          skipForward();
          showControlsTemporarily();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          showControlsTemporarily();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          showControlsTemporarily();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          showControlsTemporarily();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percent = parseInt(e.key) / 10;
          seek(duration * percent);
          showControlsTemporarily();
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [
    toggle,
    skipBackward,
    skipForward,
    setVolume,
    volume,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    seek,
    duration,
    showControlsTemporarily,
  ]);

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-black text-white/50',
          className
        )}
      >
        <span>Failed to load video</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        'relative flex flex-col h-full bg-black outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video element */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="max-w-full max-h-full object-contain"
          poster={poster}
          loop={loop}
          playsInline
          onClick={toggle}
        >
          {sources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
        </video>
      </div>

      {/* Loading spinner */}
      {loading && hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      )}

      {/* Play overlay when not started */}
      {!hasStarted && !loading && controls && (
        <button
          type="button"
          onClick={play}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:opacity-100 opacity-80"
        >
          <div className="w-20 h-20 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm">
            <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Controls overlay */}
      {controls && hasStarted && (
        <ControlsOverlay visible={showControls}>
          {/* Progress bar */}
          <div className="mb-3">
            <ProgressBar
              current={currentTime}
              duration={duration}
              onSeek={seek}
              buffered={buffered}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={toggle}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" fill="currentColor" />
              )}
            </button>

            {/* Skip backward */}
            <button
              type="button"
              onClick={skipBackward}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            {/* Skip forward */}
            <button
              type="button"
              onClick={skipForward}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>

            {/* Time display */}
            <TimeDisplay current={currentTime} duration={duration} />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Playback speed */}
            <PlaybackSpeedControl
              speed={playbackRate}
              onChange={setPlaybackRate}
            />

            {/* Volume */}
            <VolumeControl
              volume={volume}
              muted={isMuted}
              onChange={setVolume}
              onMuteToggle={toggleMute}
            />

            {/* Picture-in-Picture */}
            {document.pictureInPictureEnabled && (
              <button
                type="button"
                onClick={togglePiP}
                className={cn(
                  'p-2 hover:bg-white/10 rounded-full transition-colors',
                  isPiP && 'bg-white/20'
                )}
                aria-label={isPiP ? 'Exit picture-in-picture' : 'Enter picture-in-picture'}
              >
                <PictureInPicture2 className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Fullscreen */}
            <FullscreenButton
              fullscreen={isFullscreen}
              onClick={toggleFullscreen}
            />
          </div>
        </ControlsOverlay>
      )}

      {/* Keyboard hints (on focus) */}
      {showControls && controls && (
        <div className="absolute top-4 right-4 hidden group-focus-visible:block">
          <div className="px-2 py-1 bg-black/50 rounded text-xs text-white/60">
            Space: Play/Pause | Arrows: Seek/Volume | F: Fullscreen
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
