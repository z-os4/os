/**
 * Media Component Types
 *
 * Type definitions for media display and control components.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Media source with optional type and label
 */
export interface MediaSource {
  src: string;
  type?: string;
  label?: string;
}

// ============================================================================
// ImageViewer
// ============================================================================

export type ImageFit = 'contain' | 'cover' | 'fill' | 'none';

export interface ImageViewerProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Object fit mode */
  fit?: ImageFit;
  /** Current zoom level (1 = 100%) */
  zoom?: number;
  /** Callback when zoom changes */
  onZoomChange?: (zoom: number) => void;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Show zoom controls */
  showControls?: boolean;
  /** Called when image loads */
  onLoad?: () => void;
  /** Called on load error */
  onError?: (error: Error) => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// VideoPlayer
// ============================================================================

export interface VideoPlayerProps {
  /** Video source - string URL or array of sources */
  src: string | MediaSource[];
  /** Poster image URL */
  poster?: string;
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Start muted */
  muted?: boolean;
  /** Show controls */
  controls?: boolean;
  /** Called when playback starts */
  onPlay?: () => void;
  /** Called when playback pauses */
  onPause?: () => void;
  /** Called when playback ends */
  onEnded?: () => void;
  /** Called on time update */
  onTimeUpdate?: (time: number) => void;
  /** Called when duration is known */
  onDurationChange?: (duration: number) => void;
  /** Called on load error */
  onError?: (error: Error) => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// AudioPlayer
// ============================================================================

export interface AudioPlayerProps {
  /** Audio source - string URL or array of sources */
  src: string | MediaSource[];
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Show waveform visualization */
  showWaveform?: boolean;
  /** Artwork image URL */
  artwork?: string;
  /** Track title */
  title?: string;
  /** Artist name */
  artist?: string;
  /** Called when playback starts */
  onPlay?: () => void;
  /** Called when playback pauses */
  onPause?: () => void;
  /** Called when playback ends */
  onEnded?: () => void;
  /** Called on time update */
  onTimeUpdate?: (time: number) => void;
  /** Called on load error */
  onError?: (error: Error) => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// MediaControls
// ============================================================================

export interface PlayButtonProps {
  /** Whether media is currently playing */
  playing: boolean;
  /** Click handler */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
}

export interface VolumeControlProps {
  /** Current volume (0-1) */
  volume: number;
  /** Whether muted */
  muted: boolean;
  /** Volume change handler */
  onChange: (volume: number) => void;
  /** Mute toggle handler */
  onMuteToggle: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

export interface ProgressBarProps {
  /** Current time in seconds */
  current: number;
  /** Total duration in seconds */
  duration: number;
  /** Seek handler */
  onSeek: (time: number) => void;
  /** Buffered ranges (optional) */
  buffered?: TimeRanges | null;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

export interface TimeDisplayProps {
  /** Current time in seconds */
  current: number;
  /** Total duration in seconds */
  duration: number;
  /** Show remaining time instead */
  showRemaining?: boolean;
  /** Additional class name */
  className?: string;
}

export interface FullscreenButtonProps {
  /** Whether currently fullscreen */
  fullscreen: boolean;
  /** Click handler */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

export interface PlaybackSpeedControlProps {
  /** Current playback speed */
  speed: number;
  /** Speed change handler */
  onChange: (speed: number) => void;
  /** Available speeds */
  speeds?: number[];
  /** Additional class name */
  className?: string;
}

// ============================================================================
// useMediaControls Hook
// ============================================================================

export interface MediaControlsState {
  /** Whether media is playing */
  playing: boolean;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Current volume (0-1) */
  volume: number;
  /** Whether muted */
  muted: boolean;
  /** Whether media is loading */
  loading: boolean;
  /** Whether media has ended */
  ended: boolean;
  /** Buffered time ranges */
  buffered: TimeRanges | null;
  /** Playback speed */
  playbackRate: number;
  /** Error if any */
  error: Error | null;
}

export interface MediaControlsActions {
  /** Start playback */
  play: () => Promise<void>;
  /** Pause playback */
  pause: () => void;
  /** Toggle play/pause */
  toggle: () => void;
  /** Seek to time */
  seek: (time: number) => void;
  /** Set volume */
  setVolume: (volume: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Set playback speed */
  setPlaybackRate: (rate: number) => void;
  /** Request fullscreen */
  requestFullscreen: () => Promise<void>;
  /** Exit fullscreen */
  exitFullscreen: () => Promise<void>;
  /** Toggle fullscreen */
  toggleFullscreen: () => Promise<void>;
}

export type MediaControlsReturn = MediaControlsState & MediaControlsActions;
