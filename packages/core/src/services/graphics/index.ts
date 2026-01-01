/**
 * Graphics Module
 *
 * 2D Canvas and 3D WebGL rendering engines for zOS.
 */

// Types
export * from './types';

// Math utilities
export * from './math';

// 2D Canvas Engine
export { Canvas2DEngine } from './Canvas2D';

// 3D WebGL Engine
export { WebGL3DEngine } from './WebGL3D';

// React integration
export {
  Canvas2DProvider,
  useCanvas2DContext,
  WebGL3DProvider,
  useWebGL3DContext,
  Canvas2D,
  WebGL3DCanvas,
} from './GraphicsContext';

export type {
  Canvas2DContextType,
  Canvas2DProviderProps,
  Canvas2DProps,
  WebGL3DContextType,
  WebGL3DProviderProps,
  WebGL3DCanvasProps,
} from './GraphicsContext';
