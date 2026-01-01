/**
 * ImageViewer Component
 *
 * Zoomable, pannable image viewer with controls.
 * Supports keyboard navigation and touch gestures.
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ImageViewerProps, ImageFit } from './types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MIN_ZOOM = 0.1;
const DEFAULT_MAX_ZOOM = 10;
const ZOOM_STEP = 0.25;
const PAN_STEP = 50;

const FIT_STYLES: Record<ImageFit, string> = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
  none: 'object-none',
};

// ============================================================================
// Component
// ============================================================================

export function ImageViewer({
  src,
  alt = 'Image',
  fit = 'contain',
  zoom: controlledZoom,
  onZoomChange,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  showControls = true,
  onLoad,
  onError,
  className,
}: ImageViewerProps) {
  // State
  const [internalZoom, setInternalZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Controlled vs uncontrolled zoom
  const zoom = controlledZoom ?? internalZoom;
  const setZoom = useCallback(
    (newZoom: number | ((prev: number) => number)) => {
      const resolvedZoom = typeof newZoom === 'function' ? newZoom(zoom) : newZoom;
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, resolvedZoom));

      if (controlledZoom === undefined) {
        setInternalZoom(clampedZoom);
      }
      onZoomChange?.(clampedZoom);
    },
    [zoom, controlledZoom, minZoom, maxZoom, onZoomChange]
  );

  // Reset state when source changes
  useEffect(() => {
    setInternalZoom(1);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  // Handle image load
  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setIsLoading(false);
      onLoad?.();
    },
    [onLoad]
  );

  // Handle image error
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.(new Error('Failed to load image'));
  }, [onError]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom((z) => z + ZOOM_STEP);
  }, [setZoom]);

  const zoomOut = useCallback(() => {
    setZoom((z) => z - ZOOM_STEP);
  }, [setZoom]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [setZoom]);

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => z + delta);
    },
    [setZoom]
  );

  // Pan handling
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double-click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetView();
    }
  }, [zoom, setZoom, resetView]);

  // Keyboard controls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if container is focused or contains focus
      if (!container.contains(document.activeElement)) return;

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetView();
          break;
        case 'ArrowUp':
          if (zoom > 1) {
            e.preventDefault();
            setPosition((p) => ({ ...p, y: p.y + PAN_STEP }));
          }
          break;
        case 'ArrowDown':
          if (zoom > 1) {
            e.preventDefault();
            setPosition((p) => ({ ...p, y: p.y - PAN_STEP }));
          }
          break;
        case 'ArrowLeft':
          if (zoom > 1) {
            e.preventDefault();
            setPosition((p) => ({ ...p, x: p.x + PAN_STEP }));
          }
          break;
        case 'ArrowRight':
          if (zoom > 1) {
            e.preventDefault();
            setPosition((p) => ({ ...p, x: p.x - PAN_STEP }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, zoomIn, zoomOut, resetView]);

  // Cursor style
  const cursorStyle = useMemo(() => {
    if (isDragging) return 'cursor-grabbing';
    if (zoom > 1) return 'cursor-grab';
    return 'cursor-zoom-in';
  }, [isDragging, zoom]);

  // Error state
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-white/50',
          className
        )}
      >
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        'relative flex flex-col h-full outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
        className
      )}
    >
      {/* Image container */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center overflow-hidden',
          cursorStyle
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        )}

        {/* Image */}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={cn(
            'max-w-full max-h-full select-none',
            FIT_STYLES[fit],
            'transition-transform',
            isLoading && 'opacity-0'
          )}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transitionDuration: isDragging ? '0ms' : '150ms',
          }}
          onLoad={handleLoad}
          onError={handleError}
          draggable={false}
        />
      </div>

      {/* Controls */}
      {showControls && !isLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-full">
          {/* Zoom out */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= minZoom}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              'hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>

          {/* Zoom slider */}
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className={cn(
              'w-24 h-1 appearance-none bg-white/20 rounded-full cursor-pointer',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3',
              '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:cursor-pointer'
            )}
            aria-label="Zoom level"
          />

          {/* Zoom in */}
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= maxZoom}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              'hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-white/20 mx-1" />

          {/* Zoom percentage */}
          <span className="text-xs text-white/80 tabular-nums min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>

          {/* Divider */}
          <div className="w-px h-4 bg-white/20 mx-1" />

          {/* Reset button */}
          <button
            type="button"
            onClick={resetView}
            disabled={zoom === 1 && position.x === 0 && position.y === 0}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              'hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            aria-label="Reset view"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Pan indicator (when zoomed) */}
      {zoom > 1 && !isDragging && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 rounded text-xs text-white/60 flex items-center gap-1">
          <Move className="w-3 h-3" />
          <span>Drag to pan</span>
        </div>
      )}

      {/* Image info */}
      {!isLoading && imageSize.width > 0 && (
        <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 rounded text-xs text-white/60">
          {imageSize.width} x {imageSize.height}
        </div>
      )}
    </div>
  );
}

export default ImageViewer;
