/**
 * useGraphics - SDK hooks for 2D and 3D rendering
 *
 * Provides apps with easy access to Canvas2D and WebGL3D engines.
 *
 * @example
 * ```tsx
 * // 2D Canvas
 * const { canvasRef, engine } = useCanvas2D({
 *   onFrame: (dt, engine) => {
 *     engine.clear('#000');
 *     engine.fillCircle(100, 100, 50, { color: '#ff0' });
 *   }
 * });
 * return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
 *
 * // 3D WebGL
 * const { canvasRef, engine, scene } = useWebGL3D({
 *   onFrame: (dt, engine, scene) => {
 *     // Rotate a mesh
 *     if (scene.meshes[0]) {
 *       scene.meshes[0].transform.rotation.y += dt;
 *     }
 *   }
 * });
 * return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
 * ```
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Canvas2DEngine,
  WebGL3DEngine,
  type Canvas2DOptions,
  type Canvas2DState,
  type WebGLOptions,
  type WebGLState,
  type Scene3D,
} from '@z-os/core';

// ============================================================================
// useCanvas2D
// ============================================================================

export interface UseCanvas2DOptions extends Omit<Canvas2DOptions, 'width' | 'height'> {
  onFrame?: (dt: number, engine: Canvas2DEngine) => void;
  autoStart?: boolean;
}

export interface UseCanvas2DReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  engine: Canvas2DEngine | null;
  state: Canvas2DState | null;
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

export function useCanvas2D(options: UseCanvas2DOptions = {}): UseCanvas2DReturn {
  const { onFrame, autoStart = true, ...canvasOptions } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Canvas2DEngine | null>(null);
  const [state, setState] = useState<Canvas2DState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const onFrameRef = useRef(onFrame);

  // Keep onFrame ref updated
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get initial size
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    // Create engine
    const engine = new Canvas2DEngine(canvas, {
      ...canvasOptions,
      width,
      height,
    });

    engineRef.current = engine;

    // Subscribe to state updates
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
      setIsRunning(newState.running);
    });

    // Auto-start if enabled
    if (autoStart) {
      engine.start((dt) => {
        onFrameRef.current?.(dt, engine);
      });
    }

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          engine.resize(width, height);
        }
      }
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      unsubscribe();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start((dt) => {
        onFrameRef.current?.(dt, engineRef.current!);
      });
    }
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  return {
    canvasRef,
    engine: engineRef.current,
    state,
    start,
    stop,
    isRunning,
  };
}

// ============================================================================
// useWebGL3D
// ============================================================================

export interface UseWebGL3DOptions extends Omit<WebGLOptions, 'width' | 'height'> {
  onFrame?: (dt: number, engine: WebGL3DEngine, scene?: Scene3D) => void;
  onSetup?: (engine: WebGL3DEngine) => Scene3D | void;
  autoStart?: boolean;
}

export interface UseWebGL3DReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  engine: WebGL3DEngine | null;
  state: WebGLState | null;
  scene: Scene3D | null;
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

export function useWebGL3D(options: UseWebGL3DOptions = {}): UseWebGL3DReturn {
  const { onFrame, onSetup, autoStart = true, ...glOptions } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WebGL3DEngine | null>(null);
  const sceneRef = useRef<Scene3D | null>(null);
  const [state, setState] = useState<WebGLState | null>(null);
  const [scene, setScene] = useState<Scene3D | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const onFrameRef = useRef(onFrame);
  const onSetupRef = useRef(onSetup);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    onSetupRef.current = onSetup;
  }, [onSetup]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    const engine = new WebGL3DEngine(canvas, {
      ...glOptions,
      width,
      height,
    });

    engineRef.current = engine;

    // Subscribe to state updates
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
      setIsRunning(newState.running);
    });

    // Run setup callback to create scene
    const setupScene = onSetupRef.current?.(engine);
    if (setupScene) {
      sceneRef.current = setupScene;
      setScene(setupScene);
    } else {
      // Create default scene
      const defaultScene = engine.createScene('Main');
      engine.addAmbientLight(defaultScene, { r: 255, g: 255, b: 255, a: 1 }, 0.3);
      engine.addDirectionalLight(
        defaultScene,
        { x: 1, y: -1, z: -1 },
        { r: 255, g: 255, b: 255, a: 1 },
        1
      );
      sceneRef.current = defaultScene;
      setScene(defaultScene);
    }

    // Auto-start
    if (autoStart) {
      engine.start((dt) => {
        onFrameRef.current?.(dt, engine, sceneRef.current ?? undefined);
      });
    }

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          engine.resize(width, height);
        }
      }
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      unsubscribe();
      engine.destroy();
      engineRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start((dt) => {
        onFrameRef.current?.(dt, engineRef.current!, sceneRef.current ?? undefined);
      });
    }
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  return {
    canvasRef,
    engine: engineRef.current,
    state,
    scene,
    start,
    stop,
    isRunning,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook for basic orbit camera controls
 */
export function useOrbitControls(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  engine: WebGL3DEngine | null,
  options: {
    distance?: number;
    minDistance?: number;
    maxDistance?: number;
    rotationSpeed?: number;
    zoomSpeed?: number;
  } = {}
): void {
  const {
    distance: initialDistance = 5,
    minDistance = 1,
    maxDistance = 100,
    rotationSpeed = 0.005,
    zoomSpeed = 0.1,
  } = options;

  const stateRef = useRef({
    distance: initialDistance,
    theta: 0, // horizontal angle
    phi: Math.PI / 4, // vertical angle
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;

    const updateCamera = () => {
      const scene = engine.getActiveScene();
      if (!scene) return;

      const { distance, theta, phi } = stateRef.current;
      const { target } = scene.camera;

      // Clamp phi to avoid gimbal lock
      const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
      stateRef.current.phi = clampedPhi;

      scene.camera.position = {
        x: target.x + distance * Math.sin(clampedPhi) * Math.sin(theta),
        y: target.y + distance * Math.cos(clampedPhi),
        z: target.z + distance * Math.sin(clampedPhi) * Math.cos(theta),
      };
    };

    const handlePointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;

      const dx = e.clientX - stateRef.current.lastX;
      const dy = e.clientY - stateRef.current.lastY;

      stateRef.current.theta -= dx * rotationSpeed;
      stateRef.current.phi += dy * rotationSpeed;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;

      updateCamera();
    };

    const handlePointerUp = (e: PointerEvent) => {
      stateRef.current.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * zoomSpeed * 0.01;
      stateRef.current.distance = Math.max(
        minDistance,
        Math.min(maxDistance, stateRef.current.distance + delta)
      );
      updateCamera();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Initial update
    updateCamera();

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef, engine, minDistance, maxDistance, rotationSpeed, zoomSpeed]);
}
