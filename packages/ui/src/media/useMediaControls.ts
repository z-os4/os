/**
 * useMediaControls Hook
 *
 * Unified hook for controlling HTML media elements (audio/video).
 * Provides state and actions for playback, volume, seeking, and fullscreen.
 */

import { useState, useCallback, useEffect, RefObject } from 'react';
import type { MediaControlsReturn } from './types';

export interface UseMediaControlsOptions {
  /** Initial volume (0-1) */
  initialVolume?: number;
  /** Initial muted state */
  initialMuted?: boolean;
  /** Initial playback rate */
  initialPlaybackRate?: number;
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Callback on play */
  onPlay?: () => void;
  /** Callback on pause */
  onPause?: () => void;
  /** Callback on ended */
  onEnded?: () => void;
  /** Callback on time update */
  onTimeUpdate?: (time: number) => void;
  /** Callback on duration change */
  onDurationChange?: (duration: number) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export function useMediaControls(
  mediaRef: RefObject<HTMLMediaElement | null>,
  options: UseMediaControlsOptions = {}
): MediaControlsReturn {
  const {
    initialVolume = 1,
    initialMuted = false,
    initialPlaybackRate = 1,
    autoPlay = false,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onDurationChange,
    onError,
  } = options;

  // State
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [muted, setMuted] = useState(initialMuted);
  const [loading, setLoading] = useState(true);
  const [ended, setEnded] = useState(false);
  const [buffered, setBuffered] = useState<TimeRanges | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(initialPlaybackRate);
  const [error, setError] = useState<Error | null>(null);

  // Sync initial settings to media element
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    media.volume = initialVolume;
    media.muted = initialMuted;
    media.playbackRate = initialPlaybackRate;
  }, [mediaRef, initialVolume, initialMuted, initialPlaybackRate]);

  // Event handlers
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handlePlay = () => {
      setPlaying(true);
      setEnded(false);
      onPlay?.();
    };

    const handlePause = () => {
      setPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setPlaying(false);
      setEnded(true);
      onEnded?.();
    };

    const handleTimeUpdate = () => {
      const time = media.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };

    const handleDurationChange = () => {
      const dur = media.duration;
      if (!isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
        onDurationChange?.(dur);
      }
    };

    const handleLoadedMetadata = () => {
      setLoading(false);
      handleDurationChange();
    };

    const handleWaiting = () => {
      setLoading(true);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    const handleProgress = () => {
      setBuffered(media.buffered);
    };

    const handleVolumeChange = () => {
      setVolumeState(media.volume);
      setMuted(media.muted);
    };

    const handleRateChange = () => {
      setPlaybackRateState(media.playbackRate);
    };

    const handleError = () => {
      const err = new Error(media.error?.message || 'Media playback error');
      setError(err);
      setLoading(false);
      onError?.(err);
    };

    // Add event listeners
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    media.addEventListener('ended', handleEnded);
    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('durationchange', handleDurationChange);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('waiting', handleWaiting);
    media.addEventListener('canplay', handleCanPlay);
    media.addEventListener('progress', handleProgress);
    media.addEventListener('volumechange', handleVolumeChange);
    media.addEventListener('ratechange', handleRateChange);
    media.addEventListener('error', handleError);

    // Cleanup
    return () => {
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      media.removeEventListener('ended', handleEnded);
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('durationchange', handleDurationChange);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('waiting', handleWaiting);
      media.removeEventListener('canplay', handleCanPlay);
      media.removeEventListener('progress', handleProgress);
      media.removeEventListener('volumechange', handleVolumeChange);
      media.removeEventListener('ratechange', handleRateChange);
      media.removeEventListener('error', handleError);
    };
  }, [mediaRef, onPlay, onPause, onEnded, onTimeUpdate, onDurationChange, onError]);

  // Auto-play handling
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !autoPlay) return;

    const attemptAutoPlay = async () => {
      try {
        await media.play();
      } catch {
        // Auto-play blocked by browser, ignore
        console.debug('Autoplay blocked by browser');
      }
    };

    if (media.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      attemptAutoPlay();
    } else {
      media.addEventListener('canplaythrough', attemptAutoPlay, { once: true });
    }
  }, [mediaRef, autoPlay]);

  // Actions
  const play = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) return;
    try {
      await media.play();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Playback failed'));
    }
  }, [mediaRef]);

  const pause = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.pause();
  }, [mediaRef]);

  const toggle = useCallback(() => {
    if (playing) {
      pause();
    } else {
      play();
    }
  }, [playing, play, pause]);

  const seek = useCallback((time: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const clampedTime = Math.max(0, Math.min(time, duration || Infinity));
    media.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  }, [mediaRef, duration]);

  const setVolume = useCallback((vol: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const clampedVol = Math.max(0, Math.min(1, vol));
    media.volume = clampedVol;
    if (clampedVol > 0 && media.muted) {
      media.muted = false;
    }
  }, [mediaRef]);

  const toggleMute = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.muted = !media.muted;
  }, [mediaRef]);

  const setPlaybackRate = useCallback((rate: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.playbackRate = rate;
  }, [mediaRef]);

  const requestFullscreen = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) return;

    // For video, fullscreen the video element
    // For audio, this is a no-op
    if (media instanceof HTMLVideoElement) {
      try {
        if (media.requestFullscreen) {
          await media.requestFullscreen();
        } else if ((media as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (media as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
      } catch {
        // Fullscreen request failed
      }
    }
  }, [mediaRef]);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await exitFullscreen();
    } else {
      await requestFullscreen();
    }
  }, [requestFullscreen, exitFullscreen]);

  return {
    // State
    playing,
    currentTime,
    duration,
    volume,
    muted,
    loading,
    ended,
    buffered,
    playbackRate,
    error,
    // Actions
    play,
    pause,
    toggle,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}

export default useMediaControls;
