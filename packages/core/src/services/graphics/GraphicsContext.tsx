/**
 * GraphicsContext - React context for graphics engines
 *
 * Provides Canvas2D and WebGL3D engine access to React components.
 */

import React, { createContext, useContext, useRef, useEffect, useState, useCallback, ReactNode } from 'react';
import { Canvas2DEngine } from './Canvas2D';
import { WebGL3DEngine } from './WebGL3D';
import type { Canvas2DOptions, Canvas2DState, WebGLOptions, WebGLState } from './types';

// ============================================================================
// Canvas2D Context
// ============================================================================

export interface Canvas2DContextType {
  engine: Canvas2DEngine | null;
  state: Canvas2DState | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const Canvas2DContext = createContext<Canvas2DContextType | undefined>(undefined);

export interface Canvas2DProviderProps {
  children: ReactNode;
  options: Omit<Canvas2DOptions, 'width' | 'height'>;
  onFrame?: (dt: number, engine: Canvas2DEngine) => void;
}

export const Canvas2DProvider: React.FC<Canvas2DProviderProps> = ({ children, options, onFrame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Canvas2DEngine | null>(null);
  const [state, setState] = useState<Canvas2DState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const engine = new Canvas2DEngine(canvas, {
      ...options,
      width: rect.width,
      height: rect.height,
    });

    engineRef.current = engine;

    const unsubscribe = engine.subscribe(setState);

    engine.start((dt) => {
      onFrame?.(dt, engine);
    });

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        engine.resize(width, height);
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

  const value: Canvas2DContextType = {
    engine: engineRef.current,
    state,
    canvasRef,
  };

  return (
    <Canvas2DContext.Provider value={value}>
      {children}
    </Canvas2DContext.Provider>
  );
};

export const useCanvas2DContext = (): Canvas2DContextType => {
  const context = useContext(Canvas2DContext);
  if (!context) {
    throw new Error('useCanvas2DContext must be used within Canvas2DProvider');
  }
  return context;
};

// ============================================================================
// WebGL3D Context
// ============================================================================

export interface WebGL3DContextType {
  engine: WebGL3DEngine | null;
  state: WebGLState | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const WebGL3DContext = createContext<WebGL3DContextType | undefined>(undefined);

export interface WebGL3DProviderProps {
  children: ReactNode;
  options: Omit<WebGLOptions, 'width' | 'height'>;
  onFrame?: (dt: number, engine: WebGL3DEngine) => void;
}

export const WebGL3DProvider: React.FC<WebGL3DProviderProps> = ({ children, options, onFrame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WebGL3DEngine | null>(null);
  const [state, setState] = useState<WebGLState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const engine = new WebGL3DEngine(canvas, {
      ...options,
      width: rect.width,
      height: rect.height,
    });

    engineRef.current = engine;

    const unsubscribe = engine.subscribe(setState);

    engine.start((dt) => {
      onFrame?.(dt, engine);
    });

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        engine.resize(width, height);
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

  const value: WebGL3DContextType = {
    engine: engineRef.current,
    state,
    canvasRef,
  };

  return (
    <WebGL3DContext.Provider value={value}>
      {children}
    </WebGL3DContext.Provider>
  );
};

export const useWebGL3DContext = (): WebGL3DContextType => {
  const context = useContext(WebGL3DContext);
  if (!context) {
    throw new Error('useWebGL3DContext must be used within WebGL3DProvider');
  }
  return context;
};

// ============================================================================
// Canvas Components
// ============================================================================

export interface Canvas2DProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  options?: Omit<Canvas2DOptions, 'width' | 'height'>;
  onFrame?: (dt: number, engine: Canvas2DEngine) => void;
  onEngineReady?: (engine: Canvas2DEngine) => void;
}

export const Canvas2D = React.forwardRef<HTMLCanvasElement, Canvas2DProps>(
  ({ options = {}, onFrame, onEngineReady, style, ...props }, ref) => {
    const localRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || localRef;
    const engineRef = useRef<Canvas2DEngine | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const engine = new Canvas2DEngine(canvas, {
        ...options,
        width: rect.width || 800,
        height: rect.height || 600,
      });

      engineRef.current = engine;
      onEngineReady?.(engine);

      engine.start((dt) => {
        onFrame?.(dt, engine);
      });

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
        engine.destroy();
        engineRef.current = null;
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', ...style }}
        {...props}
      />
    );
  }
);

Canvas2D.displayName = 'Canvas2D';

export interface WebGL3DCanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  options?: Omit<WebGLOptions, 'width' | 'height'>;
  onFrame?: (dt: number, engine: WebGL3DEngine) => void;
  onEngineReady?: (engine: WebGL3DEngine) => void;
}

export const WebGL3DCanvas = React.forwardRef<HTMLCanvasElement, WebGL3DCanvasProps>(
  ({ options = {}, onFrame, onEngineReady, style, ...props }, ref) => {
    const localRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || localRef;
    const engineRef = useRef<WebGL3DEngine | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const engine = new WebGL3DEngine(canvas, {
        ...options,
        width: rect.width || 800,
        height: rect.height || 600,
      });

      engineRef.current = engine;
      onEngineReady?.(engine);

      engine.start((dt) => {
        onFrame?.(dt, engine);
      });

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
        engine.destroy();
        engineRef.current = null;
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', ...style }}
        {...props}
      />
    );
  }
);

WebGL3DCanvas.displayName = 'WebGL3DCanvas';
