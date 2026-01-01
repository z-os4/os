/**
 * Media Components
 *
 * Components for displaying and controlling media (images, video, audio).
 */

// Types
export type {
  MediaSource,
  ImageFit,
  ImageViewerProps,
  VideoPlayerProps,
  AudioPlayerProps,
  PlayButtonProps,
  VolumeControlProps,
  ProgressBarProps,
  TimeDisplayProps,
  FullscreenButtonProps,
  PlaybackSpeedControlProps,
  MediaControlsState,
  MediaControlsActions,
  MediaControlsReturn,
} from './types';

// Hook
export { useMediaControls } from './useMediaControls';
export type { UseMediaControlsOptions } from './useMediaControls';

// Shared controls
export {
  PlayButton,
  VolumeControl,
  ProgressBar,
  TimeDisplay,
  FullscreenButton,
  PlaybackSpeedControl,
  ControlsOverlay,
  formatTime,
} from './MediaControls';
export type { ControlsOverlayProps } from './MediaControls';

// Main components
export { ImageViewer } from './ImageViewer';
export { VideoPlayer } from './VideoPlayer';
export { AudioPlayer } from './AudioPlayer';
