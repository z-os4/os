/**
 * AudioPlayer Component
 *
 * Audio player with optional waveform visualization, artwork, and metadata display.
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { Music, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMediaControls } from './useMediaControls';
import {
  PlayButton,
  VolumeControl,
  ProgressBar,
  TimeDisplay,
  formatTime,
} from './MediaControls';
import type { AudioPlayerProps, MediaSource } from './types';

// ============================================================================
// Constants
// ============================================================================

const WAVEFORM_SAMPLES = 100;
const SKIP_SECONDS = 10;

// ============================================================================
// Waveform Component
// ============================================================================

interface WaveformProps {
  data: number[];
  progress: number;
  onSeek: (progress: number) => void;
  className?: string;
}

function Waveform({ data, progress, onSeek, className }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / data.length;
    const progressX = progress * width;

    data.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = Math.max(2, value * height * 0.8);
      const y = (height - barHeight) / 2;

      // Gradient based on progress
      if (x < progressX) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      }

      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });
  }, [data, progress]);

  // Handle click to seek
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickProgress = x / rect.width;
      onSeek(Math.max(0, Math.min(1, clickProgress)));
    },
    [onSeek]
  );

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-20 cursor-pointer"
        onClick={handleClick}
      />
    </div>
  );
}

// ============================================================================
// Hook for generating waveform data
// ============================================================================

function useWaveformData(src: string): number[] {
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    const generateWaveform = async () => {
      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();

        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        if (cancelled) {
          audioContext.close();
          return;
        }

        const rawData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(rawData.length / WAVEFORM_SAMPLES);
        const filteredData: number[] = [];

        for (let i = 0; i < WAVEFORM_SAMPLES; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j] || 0);
          }
          filteredData.push(sum / blockSize);
        }

        // Normalize
        const max = Math.max(...filteredData, 0.01);
        const normalized = filteredData.map((n) => n / max);

        if (!cancelled) {
          setWaveformData(normalized);
        }

        audioContext.close();
      } catch {
        // If waveform generation fails, use placeholder
        if (!cancelled) {
          setWaveformData(
            Array(WAVEFORM_SAMPLES)
              .fill(0)
              .map(() => 0.1 + Math.random() * 0.5)
          );
        }
      }
    };

    generateWaveform();

    return () => {
      cancelled = true;
    };
  }, [src]);

  return waveformData;
}

// ============================================================================
// Component
// ============================================================================

export function AudioPlayer({
  src,
  autoPlay = false,
  loop = false,
  showWaveform = true,
  artwork,
  title,
  artist,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
  className,
}: AudioPlayerProps) {
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  // Normalize sources
  const sources = useMemo((): MediaSource[] => {
    if (typeof src === 'string') {
      return [{ src }];
    }
    return src;
  }, [src]);

  const primarySrc = sources[0]?.src || '';

  // Waveform data
  const waveformData = useWaveformData(showWaveform ? primarySrc : '');

  // Media controls hook
  const mediaControls = useMediaControls(audioRef, {
    autoPlay,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onError,
  });

  const {
    playing,
    currentTime,
    duration,
    volume,
    muted,
    loading,
    error,
    toggle,
    seek,
    setVolume,
    toggleMute,
  } = mediaControls;

  // Calculate progress
  const progress = duration > 0 ? currentTime / duration : 0;

  // Seek handlers
  const skipBackward = useCallback(() => {
    seek(Math.max(0, currentTime - SKIP_SECONDS));
  }, [seek, currentTime]);

  const skipForward = useCallback(() => {
    seek(Math.min(duration, currentTime + SKIP_SECONDS));
  }, [seek, currentTime, duration]);

  const handleWaveformSeek = useCallback(
    (seekProgress: number) => {
      seek(seekProgress * duration);
    },
    [seek, duration]
  );

  // Display name
  const displayTitle = title || primarySrc.split('/').pop() || 'Unknown Track';

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-white/50',
          className
        )}
      >
        <span>Failed to load audio</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-full p-8',
        className
      )}
    >
      {/* Audio element */}
      <audio ref={audioRef} loop={loop} preload="metadata">
        {sources.map((source, index) => (
          <source key={index} src={source.src} type={source.type} />
        ))}
      </audio>

      {/* Artwork */}
      <div
        className={cn(
          'w-48 h-48 mb-6 rounded-2xl overflow-hidden shadow-xl',
          'bg-gradient-to-br from-purple-500/30 to-blue-500/30',
          'flex items-center justify-center'
        )}
      >
        {artwork ? (
          <img
            src={artwork}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music className="w-24 h-24 text-white/40" />
        )}
      </div>

      {/* Title and artist */}
      <div className="text-center mb-6 max-w-full px-4">
        <div className="text-lg font-medium text-white/90 truncate">
          {displayTitle}
        </div>
        {artist && (
          <div className="text-sm text-white/60 truncate mt-1">{artist}</div>
        )}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center mb-6">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      )}

      {/* Waveform or progress bar */}
      {!loading && (
        <div className="w-full max-w-md mb-4">
          {showWaveform && waveformData.length > 0 ? (
            <Waveform
              data={waveformData}
              progress={progress}
              onSeek={handleWaveformSeek}
            />
          ) : (
            <ProgressBar
              current={currentTime}
              duration={duration}
              onSeek={seek}
            />
          )}
        </div>
      )}

      {/* Time display */}
      <div className="mb-6">
        <TimeDisplay current={currentTime} duration={duration} />
      </div>

      {/* Main controls */}
      <div className="flex items-center gap-6">
        {/* Skip backward */}
        <button
          type="button"
          onClick={skipBackward}
          disabled={loading}
          className={cn(
            'p-2 rounded-full transition-colors',
            'hover:bg-white/10 disabled:opacity-50'
          )}
          aria-label="Skip backward 10 seconds"
        >
          <SkipBack className="w-6 h-6 text-white/70" />
        </button>

        {/* Play/Pause */}
        <PlayButton
          playing={playing}
          onClick={toggle}
          disabled={loading}
          size="lg"
        />

        {/* Skip forward */}
        <button
          type="button"
          onClick={skipForward}
          disabled={loading}
          className={cn(
            'p-2 rounded-full transition-colors',
            'hover:bg-white/10 disabled:opacity-50'
          )}
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="w-6 h-6 text-white/70" />
        </button>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center gap-4 mt-6">
        {/* Loop indicator */}
        {loop && (
          <div className="flex items-center gap-1 text-xs text-white/50">
            <Repeat className="w-4 h-4" />
            <span>Loop</span>
          </div>
        )}

        {/* Volume */}
        <VolumeControl
          volume={volume}
          muted={muted}
          onChange={setVolume}
          onMuteToggle={toggleMute}
          disabled={loading}
        />
      </div>
    </div>
  );
}

export default AudioPlayer;
