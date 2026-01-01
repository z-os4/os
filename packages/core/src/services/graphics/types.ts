/**
 * Graphics Engine Types
 *
 * Shared types for 2D Canvas and 3D WebGL rendering engines.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Color {
  r: number; // 0-255
  g: number;
  b: number;
  a: number; // 0-1
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transform2D {
  position: Vec2;
  rotation: number; // radians
  scale: Vec2;
  origin: Vec2; // pivot point (0-1)
}

export interface Transform3D {
  position: Vec3;
  rotation: Vec3; // euler angles in radians
  scale: Vec3;
}

// ============================================================================
// 2D Canvas Engine Types
// ============================================================================

export type BlendMode =
  | 'source-over'
  | 'source-in'
  | 'source-out'
  | 'source-atop'
  | 'destination-over'
  | 'destination-in'
  | 'destination-out'
  | 'destination-atop'
  | 'lighter'
  | 'copy'
  | 'xor'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'round' | 'bevel' | 'miter';
export type TextAlign = 'left' | 'right' | 'center' | 'start' | 'end';
export type TextBaseline = 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';

export interface StrokeStyle {
  color: string | Color;
  width: number;
  cap?: LineCap;
  join?: LineJoin;
  dashPattern?: number[];
  dashOffset?: number;
}

export interface FillStyle {
  color: string | Color;
}

export interface TextStyle {
  font?: string;
  size?: number;
  align?: TextAlign;
  baseline?: TextBaseline;
  maxWidth?: number;
}

export interface ShadowStyle {
  color: string | Color;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface Sprite {
  id: string;
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap;
  sourceRect?: Rect; // For sprite sheets
  width: number;
  height: number;
}

export interface DrawableSprite extends Sprite {
  transform: Transform2D;
  alpha: number;
  blendMode: BlendMode;
  visible: boolean;
  zIndex: number;
}

export interface Layer2D {
  id: string;
  name: string;
  visible: boolean;
  alpha: number;
  blendMode: BlendMode;
  sprites: DrawableSprite[];
}

export interface Canvas2DOptions {
  width: number;
  height: number;
  pixelRatio?: number;
  alpha?: boolean;
  antialias?: boolean;
}

export interface Canvas2DState {
  width: number;
  height: number;
  pixelRatio: number;
  fps: number;
  frameCount: number;
  deltaTime: number;
  running: boolean;
}

// ============================================================================
// 3D WebGL Engine Types
// ============================================================================

export type ProjectionType = 'perspective' | 'orthographic';

export interface Camera3D {
  id: string;
  type: ProjectionType;
  position: Vec3;
  target: Vec3;
  up: Vec3;
  fov: number; // For perspective
  near: number;
  far: number;
  zoom: number; // For orthographic
}

export type LightType = 'ambient' | 'directional' | 'point' | 'spot';

export interface Light3D {
  id: string;
  type: LightType;
  color: Color;
  intensity: number;
  position?: Vec3;
  direction?: Vec3;
  range?: number; // For point/spot
  angle?: number; // For spot
  penumbra?: number; // For spot
  castShadow?: boolean;
}

export interface Material {
  id: string;
  name: string;
  color: Color;
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
  opacity: number;
  texture?: WebGLTexture;
  normalMap?: WebGLTexture;
  wireframe?: boolean;
  doubleSided?: boolean;
}

export interface Geometry {
  id: string;
  vertices: Float32Array;
  normals?: Float32Array;
  uvs?: Float32Array;
  indices?: Uint16Array | Uint32Array;
  vertexCount: number;
}

export interface Mesh3D {
  id: string;
  name: string;
  geometry: Geometry;
  material: Material;
  transform: Transform3D;
  visible: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface Scene3D {
  id: string;
  name: string;
  meshes: Mesh3D[];
  lights: Light3D[];
  camera: Camera3D;
  background: Color;
  fog?: {
    color: Color;
    near: number;
    far: number;
  };
}

export interface WebGLOptions {
  width: number;
  height: number;
  pixelRatio?: number;
  antialias?: boolean;
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  preserveDrawingBuffer?: boolean;
}

export interface WebGLState {
  width: number;
  height: number;
  pixelRatio: number;
  fps: number;
  frameCount: number;
  deltaTime: number;
  running: boolean;
  drawCalls: number;
  triangles: number;
}

// ============================================================================
// Animation Types
// ============================================================================

export type EasingFunction = (t: number) => number;

export interface AnimationKeyframe<T> {
  time: number; // 0-1 normalized
  value: T;
  easing?: EasingFunction;
}

export interface Animation<T> {
  id: string;
  keyframes: AnimationKeyframe<T>[];
  duration: number; // ms
  loop: boolean;
  pingPong: boolean;
  onComplete?: () => void;
}

export interface AnimationState {
  currentTime: number;
  playing: boolean;
  speed: number;
}

// ============================================================================
// Input Types (for game-like interactions)
// ============================================================================

export interface Pointer {
  id: number;
  x: number;
  y: number;
  pressure: number;
  isDown: boolean;
}

export interface InputState {
  pointers: Map<number, Pointer>;
  keys: Set<string>;
  mouseX: number;
  mouseY: number;
  mouseButtons: number;
}
