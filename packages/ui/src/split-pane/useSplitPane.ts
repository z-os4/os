/**
 * useSplitPane Hook
 *
 * Core logic for managing split pane resize state.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  UseSplitPaneOptions,
  UseSplitPaneResult,
  PaneSize,
  SplitDirection,
} from './types';

// Default constraints
const DEFAULT_MIN_SIZE = 50;
const DEFAULT_MAX_SIZE = Infinity;
const DEFAULT_GUTTER_SIZE = 4;

/**
 * Parse a PaneSize to pixels given total available space.
 */
function parseSizeToPixels(
  size: PaneSize | undefined,
  totalSpace: number,
  fallback: number
): number {
  if (size === undefined || size === 'auto') {
    return fallback;
  }
  if (typeof size === 'number') {
    return size;
  }
  // Handle percentage strings
  if (size.endsWith('%')) {
    const percent = parseFloat(size);
    return (percent / 100) * totalSpace;
  }
  // Handle pixel strings
  if (size.endsWith('px')) {
    return parseFloat(size);
  }
  // Try parsing as number
  const parsed = parseFloat(size);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Calculate initial sizes for panes.
 */
function calculateInitialSizes(
  count: number,
  defaultSizes: PaneSize[] | undefined,
  minSizes: PaneSize[] | undefined,
  totalSpace: number,
  gutterSize: number
): number[] {
  const gutterTotal = (count - 1) * gutterSize;
  const availableSpace = totalSpace - gutterTotal;
  const equalSize = availableSpace / count;

  const sizes: number[] = [];
  let allocatedSpace = 0;
  let autoCount = 0;

  // First pass: calculate fixed sizes and count auto panes
  for (let i = 0; i < count; i++) {
    const defaultSize = defaultSizes?.[i];
    if (defaultSize === undefined || defaultSize === 'auto') {
      sizes.push(-1); // Mark as auto
      autoCount++;
    } else {
      const size = parseSizeToPixels(defaultSize, totalSpace, equalSize);
      const minSize = parseSizeToPixels(minSizes?.[i], totalSpace, DEFAULT_MIN_SIZE);
      const clampedSize = Math.max(size, minSize);
      sizes.push(clampedSize);
      allocatedSpace += clampedSize;
    }
  }

  // Second pass: distribute remaining space to auto panes
  if (autoCount > 0) {
    const remainingSpace = Math.max(0, availableSpace - allocatedSpace);
    const autoSize = remainingSpace / autoCount;
    for (let i = 0; i < count; i++) {
      if (sizes[i] === -1) {
        const minSize = parseSizeToPixels(minSizes?.[i], totalSpace, DEFAULT_MIN_SIZE);
        sizes[i] = Math.max(autoSize, minSize);
      }
    }
  }

  return sizes;
}

/**
 * Load persisted sizes from localStorage.
 */
function loadPersistedSizes(persistKey: string | undefined): number[] | null {
  if (!persistKey || typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`splitpane:${persistKey}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((s) => typeof s === 'number')) {
        return parsed;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

/**
 * Save sizes to localStorage.
 */
function savePersistedSizes(persistKey: string | undefined, sizes: number[]): void {
  if (!persistKey || typeof window === 'undefined') return;
  try {
    localStorage.setItem(`splitpane:${persistKey}`, JSON.stringify(sizes));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook for managing split pane resize logic.
 */
export function useSplitPane(options: UseSplitPaneOptions): UseSplitPaneResult {
  const {
    count,
    direction,
    defaultSizes,
    minSizes,
    maxSizes,
    containerRef,
    onResize,
    snapOffset = 0,
    gutterSize = DEFAULT_GUTTER_SIZE,
    persistKey,
  } = options;

  // State
  const [sizes, setSizesState] = useState<number[]>(() => {
    // Try to load persisted sizes first
    const persisted = loadPersistedSizes(persistKey);
    if (persisted && persisted.length === count) {
      return persisted;
    }
    // Fall back to calculating initial sizes
    return new Array(count).fill(100); // Placeholder until measured
  });

  const [collapsedPanes, setCollapsedPanes] = useState<boolean[]>(
    new Array(count).fill(false)
  );
  const [isResizing, setIsResizing] = useState(false);
  const [resizingGutter, setResizingGutter] = useState<number | null>(null);

  // Refs for tracking resize state
  const startPosRef = useRef(0);
  const startSizesRef = useRef<number[]>([]);
  const sizesBeforeCollapseRef = useRef<number[]>(new Array(count).fill(100));

  // Calculate available space
  const getContainerSize = useCallback((): number => {
    if (!containerRef?.current) return 600; // Default fallback
    const rect = containerRef.current.getBoundingClientRect();
    return direction === 'horizontal' ? rect.width : rect.height;
  }, [containerRef, direction]);

  // Parse min/max sizes to pixels
  const getConstraints = useCallback(
    (index: number, totalSpace: number) => {
      const minSize = parseSizeToPixels(
        minSizes?.[index],
        totalSpace,
        DEFAULT_MIN_SIZE
      );
      const maxSize = parseSizeToPixels(
        maxSizes?.[index],
        totalSpace,
        DEFAULT_MAX_SIZE
      );
      return { minSize, maxSize };
    },
    [minSizes, maxSizes]
  );

  // Initialize sizes when container is available
  useEffect(() => {
    if (!containerRef?.current) return;

    const persisted = loadPersistedSizes(persistKey);
    if (persisted && persisted.length === count) {
      setSizesState(persisted);
      return;
    }

    const totalSpace = getContainerSize();
    const initialSizes = calculateInitialSizes(
      count,
      defaultSizes,
      minSizes,
      totalSpace,
      gutterSize
    );
    setSizesState(initialSizes);
    sizesBeforeCollapseRef.current = [...initialSizes];
  }, [containerRef, count, defaultSizes, minSizes, gutterSize, getContainerSize, persistKey]);

  // Set sizes and persist
  const setSizes = useCallback(
    (newSizes: number[]) => {
      setSizesState(newSizes);
      savePersistedSizes(persistKey, newSizes);
      onResize?.(newSizes);
    },
    [persistKey, onResize]
  );

  // Start resize operation
  const startResize = useCallback(
    (gutterIndex: number) => {
      setIsResizing(true);
      setResizingGutter(gutterIndex);
      startSizesRef.current = [...sizes];
    },
    [sizes]
  );

  // Handle mouse/touch move during resize
  const handleResize = useCallback(
    (clientX: number, clientY: number) => {
      if (resizingGutter === null) return;

      const currentPos = direction === 'horizontal' ? clientX : clientY;
      const delta = currentPos - startPosRef.current;
      const totalSpace = getContainerSize();

      const leftIndex = resizingGutter;
      const rightIndex = resizingGutter + 1;

      const startSizes = startSizesRef.current;
      let newLeftSize = startSizes[leftIndex] + delta;
      let newRightSize = startSizes[rightIndex] - delta;

      // Apply constraints
      const leftConstraints = getConstraints(leftIndex, totalSpace);
      const rightConstraints = getConstraints(rightIndex, totalSpace);

      // Clamp left pane
      if (newLeftSize < leftConstraints.minSize) {
        const diff = leftConstraints.minSize - newLeftSize;
        newLeftSize = leftConstraints.minSize;
        newRightSize += diff;
      } else if (newLeftSize > leftConstraints.maxSize) {
        const diff = newLeftSize - leftConstraints.maxSize;
        newLeftSize = leftConstraints.maxSize;
        newRightSize += diff;
      }

      // Clamp right pane
      if (newRightSize < rightConstraints.minSize) {
        const diff = rightConstraints.minSize - newRightSize;
        newRightSize = rightConstraints.minSize;
        newLeftSize -= diff;
      } else if (newRightSize > rightConstraints.maxSize) {
        const diff = newRightSize - rightConstraints.maxSize;
        newRightSize = rightConstraints.maxSize;
        newLeftSize -= diff;
      }

      // Apply snap offset
      if (snapOffset > 0) {
        if (newLeftSize <= snapOffset) {
          newRightSize += newLeftSize;
          newLeftSize = 0;
        } else if (newRightSize <= snapOffset) {
          newLeftSize += newRightSize;
          newRightSize = 0;
        }
      }

      const newSizes = [...sizes];
      newSizes[leftIndex] = newLeftSize;
      newSizes[rightIndex] = newRightSize;

      setSizes(newSizes);
    },
    [resizingGutter, direction, getContainerSize, getConstraints, sizes, setSizes, snapOffset]
  );

  // End resize operation
  const endResize = useCallback(() => {
    setIsResizing(false);
    setResizingGutter(null);
  }, []);

  // Set start position when resize begins
  useEffect(() => {
    if (!isResizing || resizingGutter === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleResize(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleResize(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => endResize();
    const handleTouchEnd = () => endResize();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing, resizingGutter, handleResize, endResize]);

  // Collapse a pane
  const collapse = useCallback(
    (index: number) => {
      if (index < 0 || index >= count) return;
      if (collapsedPanes[index]) return;

      // Store size before collapse
      sizesBeforeCollapseRef.current[index] = sizes[index];

      // Distribute collapsed size to adjacent panes
      const collapseSize = sizes[index];
      const newSizes = [...sizes];
      newSizes[index] = 0;

      // Give space to next pane, or previous if last
      const targetIndex = index < count - 1 ? index + 1 : index - 1;
      if (targetIndex >= 0 && targetIndex < count) {
        newSizes[targetIndex] += collapseSize;
      }

      setSizes(newSizes);
      setCollapsedPanes((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    },
    [count, collapsedPanes, sizes, setSizes]
  );

  // Expand a pane
  const expand = useCallback(
    (index: number) => {
      if (index < 0 || index >= count) return;
      if (!collapsedPanes[index]) return;

      const restoreSize = sizesBeforeCollapseRef.current[index] || 100;

      // Take space from adjacent pane
      const targetIndex = index < count - 1 ? index + 1 : index - 1;
      const newSizes = [...sizes];

      if (targetIndex >= 0 && targetIndex < count) {
        const totalSpace = getContainerSize();
        const constraints = getConstraints(targetIndex, totalSpace);
        const takeAmount = Math.min(
          restoreSize,
          sizes[targetIndex] - constraints.minSize
        );
        newSizes[index] = takeAmount;
        newSizes[targetIndex] -= takeAmount;
      } else {
        newSizes[index] = restoreSize;
      }

      setSizes(newSizes);
      setCollapsedPanes((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    },
    [count, collapsedPanes, sizes, setSizes, getContainerSize, getConstraints]
  );

  // Reset to default sizes
  const resetSizes = useCallback(() => {
    const totalSpace = getContainerSize();
    const initialSizes = calculateInitialSizes(
      count,
      defaultSizes,
      minSizes,
      totalSpace,
      gutterSize
    );
    setSizes(initialSizes);
    setCollapsedPanes(new Array(count).fill(false));
    sizesBeforeCollapseRef.current = [...initialSizes];
  }, [count, defaultSizes, minSizes, gutterSize, getContainerSize, setSizes]);

  return {
    sizes,
    setSizes,
    collapse,
    expand,
    resetSizes,
    startResize,
    handleResize,
    endResize,
    isResizing,
    resizingGutter,
    collapsedPanes,
  };
}
