/**
 * Canvas2D - Hardware-accelerated 2D rendering engine
 *
 * Provides a clean API for 2D graphics using the Canvas API:
 * - Sprite rendering with transformations
 * - Shape drawing (rects, circles, paths, polygons)
 * - Text rendering
 * - Layer management with compositing
 * - Animation loop with delta time
 * - Input handling
 */

import type {
  Vec2,
  Color,
  Rect,
  Transform2D,
  BlendMode,
  StrokeStyle,
  FillStyle,
  TextStyle,
  ShadowStyle,
  Sprite,
  DrawableSprite,
  Layer2D,
  Canvas2DOptions,
  Canvas2DState,
  InputState,
  Pointer,
} from './types';

function colorToString(color: string | Color): string {
  if (typeof color === 'string') return color;
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

function generateId(): string {
  return `c2d-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export class Canvas2DEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  private state: Canvas2DState;
  private layers: Map<string, Layer2D> = new Map();
  private sprites: Map<string, Sprite> = new Map();
  private inputState: InputState;

  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCallback: ((dt: number) => void) | null = null;
  private subscribers: Set<(state: Canvas2DState) => void> = new Set();

  constructor(canvas: HTMLCanvasElement, options: Canvas2DOptions) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: options.alpha ?? true });
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;

    // Create offscreen canvas for double buffering
    this.offscreenCanvas = document.createElement('canvas');
    const offCtx = this.offscreenCanvas.getContext('2d');
    if (!offCtx) throw new Error('Failed to get offscreen 2D context');
    this.offscreenCtx = offCtx;

    const pixelRatio = options.pixelRatio ?? window.devicePixelRatio ?? 1;

    this.state = {
      width: options.width,
      height: options.height,
      pixelRatio,
      fps: 0,
      frameCount: 0,
      deltaTime: 0,
      running: false,
    };

    this.inputState = {
      pointers: new Map(),
      keys: new Set(),
      mouseX: 0,
      mouseY: 0,
      mouseButtons: 0,
    };

    this.resize(options.width, options.height);
    this.setupInputHandlers();

    if (options.antialias !== false) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  resize(width: number, height: number): void {
    const { pixelRatio } = this.state;

    this.canvas.width = width * pixelRatio;
    this.canvas.height = height * pixelRatio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.offscreenCanvas.width = width * pixelRatio;
    this.offscreenCanvas.height = height * pixelRatio;

    this.ctx.scale(pixelRatio, pixelRatio);
    this.offscreenCtx.scale(pixelRatio, pixelRatio);

    this.state.width = width;
    this.state.height = height;
    this.notify();
  }

  start(callback?: (dt: number) => void): void {
    if (this.state.running) return;
    this.state.running = true;
    this.frameCallback = callback ?? null;
    this.lastFrameTime = performance.now();
    this.loop();
    this.notify();
  }

  stop(): void {
    this.state.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.notify();
  }

  private loop = (): void => {
    if (!this.state.running) return;

    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    this.state.deltaTime = dt;
    this.state.frameCount++;
    this.state.fps = Math.round(1 / dt);

    // Call user's update function
    this.frameCallback?.(dt);

    // Render all layers
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  destroy(): void {
    this.stop();
    this.removeInputHandlers();
    this.layers.clear();
    this.sprites.clear();
    this.subscribers.clear();
  }

  // ============================================================================
  // Layer Management
  // ============================================================================

  createLayer(name: string): string {
    const id = generateId();
    const layer: Layer2D = {
      id,
      name,
      visible: true,
      alpha: 1,
      blendMode: 'source-over',
      sprites: [],
    };
    this.layers.set(id, layer);
    return id;
  }

  removeLayer(layerId: string): void {
    this.layers.delete(layerId);
  }

  getLayer(layerId: string): Layer2D | undefined {
    return this.layers.get(layerId);
  }

  setLayerVisible(layerId: string, visible: boolean): void {
    const layer = this.layers.get(layerId);
    if (layer) layer.visible = visible;
  }

  setLayerAlpha(layerId: string, alpha: number): void {
    const layer = this.layers.get(layerId);
    if (layer) layer.alpha = Math.max(0, Math.min(1, alpha));
  }

  setLayerBlendMode(layerId: string, blendMode: BlendMode): void {
    const layer = this.layers.get(layerId);
    if (layer) layer.blendMode = blendMode;
  }

  // ============================================================================
  // Sprite Management
  // ============================================================================

  async loadSprite(src: string): Promise<Sprite> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const sprite: Sprite = {
          id: generateId(),
          image,
          width: image.width,
          height: image.height,
        };
        this.sprites.set(sprite.id, sprite);
        resolve(sprite);
      };
      image.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
      image.src = src;
    });
  }

  createSpriteFromCanvas(canvas: HTMLCanvasElement): Sprite {
    const sprite: Sprite = {
      id: generateId(),
      image: canvas,
      width: canvas.width,
      height: canvas.height,
    };
    this.sprites.set(sprite.id, sprite);
    return sprite;
  }

  addSpriteToLayer(
    layerId: string,
    sprite: Sprite,
    options: Partial<Omit<DrawableSprite, 'id' | 'image' | 'width' | 'height'>> = {}
  ): DrawableSprite {
    const layer = this.layers.get(layerId);
    if (!layer) throw new Error(`Layer not found: ${layerId}`);

    const drawable: DrawableSprite = {
      ...sprite,
      transform: options.transform ?? {
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: { x: 1, y: 1 },
        origin: { x: 0.5, y: 0.5 },
      },
      alpha: options.alpha ?? 1,
      blendMode: options.blendMode ?? 'source-over',
      visible: options.visible ?? true,
      zIndex: options.zIndex ?? 0,
      sourceRect: options.sourceRect,
    };

    layer.sprites.push(drawable);
    layer.sprites.sort((a, b) => a.zIndex - b.zIndex);

    return drawable;
  }

  // ============================================================================
  // Drawing API
  // ============================================================================

  clear(color?: string | Color): void {
    const ctx = this.offscreenCtx;
    if (color) {
      ctx.fillStyle = colorToString(color);
      ctx.fillRect(0, 0, this.state.width, this.state.height);
    } else {
      ctx.clearRect(0, 0, this.state.width, this.state.height);
    }
  }

  // Rectangles
  fillRect(x: number, y: number, width: number, height: number, style: FillStyle): void {
    const ctx = this.offscreenCtx;
    ctx.fillStyle = colorToString(style.color);
    ctx.fillRect(x, y, width, height);
  }

  strokeRect(x: number, y: number, width: number, height: number, style: StrokeStyle): void {
    const ctx = this.offscreenCtx;
    this.applyStrokeStyle(ctx, style);
    ctx.strokeRect(x, y, width, height);
  }

  roundRect(x: number, y: number, width: number, height: number, radius: number, fill?: FillStyle, stroke?: StrokeStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    if (fill) {
      ctx.fillStyle = colorToString(fill.color);
      ctx.fill();
    }
    if (stroke) {
      this.applyStrokeStyle(ctx, stroke);
      ctx.stroke();
    }
  }

  // Circles and Ellipses
  fillCircle(x: number, y: number, radius: number, style: FillStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = colorToString(style.color);
    ctx.fill();
  }

  strokeCircle(x: number, y: number, radius: number, style: StrokeStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.applyStrokeStyle(ctx, style);
    ctx.stroke();
  }

  fillEllipse(x: number, y: number, radiusX: number, radiusY: number, style: FillStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = colorToString(style.color);
    ctx.fill();
  }

  strokeEllipse(x: number, y: number, radiusX: number, radiusY: number, style: StrokeStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.applyStrokeStyle(ctx, style);
    ctx.stroke();
  }

  // Lines
  line(x1: number, y1: number, x2: number, y2: number, style: StrokeStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    this.applyStrokeStyle(ctx, style);
    ctx.stroke();
  }

  polyline(points: Vec2[], style: StrokeStyle): void {
    if (points.length < 2) return;
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    this.applyStrokeStyle(ctx, style);
    ctx.stroke();
  }

  // Polygons
  fillPolygon(points: Vec2[], style: FillStyle): void {
    if (points.length < 3) return;
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = colorToString(style.color);
    ctx.fill();
  }

  strokePolygon(points: Vec2[], style: StrokeStyle): void {
    if (points.length < 3) return;
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    this.applyStrokeStyle(ctx, style);
    ctx.stroke();
  }

  // Arcs
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, style: StrokeStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    this.applyStrokeStyle(ctx, style);
    ctx.stroke();
  }

  // Bezier Curves
  quadraticCurve(start: Vec2, control: Vec2, end: Vec2, style: StrokeStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
    this.applyStrokeStyle(ctx, style);
    ctx.stroke();
  }

  bezierCurve(start: Vec2, control1: Vec2, control2: Vec2, end: Vec2, style: StrokeStyle): void {
    const ctx = this.offscreenCtx;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, end.x, end.y);
    this.applyStrokeStyle(ctx, style);
    ctx.stroke();
  }

  // Text
  fillText(text: string, x: number, y: number, style: FillStyle, textStyle?: TextStyle): void {
    const ctx = this.offscreenCtx;
    this.applyTextStyle(ctx, textStyle);
    ctx.fillStyle = colorToString(style.color);
    if (textStyle?.maxWidth) {
      ctx.fillText(text, x, y, textStyle.maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }
  }

  strokeText(text: string, x: number, y: number, style: StrokeStyle, textStyle?: TextStyle): void {
    const ctx = this.offscreenCtx;
    this.applyTextStyle(ctx, textStyle);
    this.applyStrokeStyle(ctx, style);
    if (textStyle?.maxWidth) {
      ctx.strokeText(text, x, y, textStyle.maxWidth);
    } else {
      ctx.strokeText(text, x, y);
    }
  }

  measureText(text: string, textStyle?: TextStyle): TextMetrics {
    const ctx = this.offscreenCtx;
    this.applyTextStyle(ctx, textStyle);
    return ctx.measureText(text);
  }

  // Images
  drawImage(
    image: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
    x: number,
    y: number,
    width?: number,
    height?: number,
    sourceRect?: Rect
  ): void {
    const ctx = this.offscreenCtx;
    if (sourceRect) {
      ctx.drawImage(
        image,
        sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
        x, y, width ?? sourceRect.width, height ?? sourceRect.height
      );
    } else if (width !== undefined && height !== undefined) {
      ctx.drawImage(image, x, y, width, height);
    } else {
      ctx.drawImage(image, x, y);
    }
  }

  drawSprite(sprite: Sprite, x: number, y: number, width?: number, height?: number): void {
    this.drawImage(sprite.image, x, y, width ?? sprite.width, height ?? sprite.height, sprite.sourceRect);
  }

  // Transformations
  save(): void {
    this.offscreenCtx.save();
  }

  restore(): void {
    this.offscreenCtx.restore();
  }

  translate(x: number, y: number): void {
    this.offscreenCtx.translate(x, y);
  }

  rotate(angle: number): void {
    this.offscreenCtx.rotate(angle);
  }

  scale(x: number, y: number): void {
    this.offscreenCtx.scale(x, y);
  }

  transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.offscreenCtx.transform(a, b, c, d, e, f);
  }

  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.offscreenCtx.setTransform(a, b, c, d, e, f);
  }

  resetTransform(): void {
    this.offscreenCtx.resetTransform();
    this.offscreenCtx.scale(this.state.pixelRatio, this.state.pixelRatio);
  }

  // Effects
  setAlpha(alpha: number): void {
    this.offscreenCtx.globalAlpha = alpha;
  }

  setBlendMode(mode: BlendMode): void {
    this.offscreenCtx.globalCompositeOperation = mode;
  }

  setShadow(shadow: ShadowStyle | null): void {
    const ctx = this.offscreenCtx;
    if (shadow) {
      ctx.shadowColor = colorToString(shadow.color);
      ctx.shadowBlur = shadow.blur;
      ctx.shadowOffsetX = shadow.offsetX;
      ctx.shadowOffsetY = shadow.offsetY;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }

  // Clipping
  clip(path?: Path2D): void {
    if (path) {
      this.offscreenCtx.clip(path);
    } else {
      this.offscreenCtx.clip();
    }
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  private render(): void {
    // Render layers to offscreen canvas
    for (const layer of this.layers.values()) {
      if (!layer.visible || layer.alpha <= 0) continue;

      this.offscreenCtx.save();
      this.offscreenCtx.globalAlpha = layer.alpha;
      this.offscreenCtx.globalCompositeOperation = layer.blendMode;

      for (const sprite of layer.sprites) {
        if (!sprite.visible || sprite.alpha <= 0) continue;
        this.renderSprite(sprite);
      }

      this.offscreenCtx.restore();
    }

    // Copy to main canvas
    this.ctx.clearRect(0, 0, this.state.width, this.state.height);
    this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.state.width, this.state.height);
  }

  private renderSprite(sprite: DrawableSprite): void {
    const ctx = this.offscreenCtx;
    const { transform } = sprite;

    ctx.save();

    ctx.globalAlpha *= sprite.alpha;
    ctx.globalCompositeOperation = sprite.blendMode;

    // Apply transform
    ctx.translate(transform.position.x, transform.position.y);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scale.x, transform.scale.y);

    // Draw with origin offset
    const ox = -sprite.width * transform.origin.x;
    const oy = -sprite.height * transform.origin.y;

    if (sprite.sourceRect) {
      ctx.drawImage(
        sprite.image,
        sprite.sourceRect.x, sprite.sourceRect.y,
        sprite.sourceRect.width, sprite.sourceRect.height,
        ox, oy, sprite.width, sprite.height
      );
    } else {
      ctx.drawImage(sprite.image, ox, oy, sprite.width, sprite.height);
    }

    ctx.restore();
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private applyStrokeStyle(ctx: CanvasRenderingContext2D, style: StrokeStyle): void {
    ctx.strokeStyle = colorToString(style.color);
    ctx.lineWidth = style.width;
    ctx.lineCap = style.cap ?? 'butt';
    ctx.lineJoin = style.join ?? 'miter';
    if (style.dashPattern) {
      ctx.setLineDash(style.dashPattern);
      ctx.lineDashOffset = style.dashOffset ?? 0;
    } else {
      ctx.setLineDash([]);
    }
  }

  private applyTextStyle(ctx: CanvasRenderingContext2D, style?: TextStyle): void {
    if (style?.font || style?.size) {
      ctx.font = `${style.size ?? 16}px ${style.font ?? 'sans-serif'}`;
    }
    ctx.textAlign = style?.align ?? 'start';
    ctx.textBaseline = style?.baseline ?? 'alphabetic';
  }

  // ============================================================================
  // Input Handling
  // ============================================================================

  private setupInputHandlers(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private removeInputHandlers(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private getCanvasCoords(e: PointerEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private handlePointerDown = (e: PointerEvent): void => {
    const coords = this.getCanvasCoords(e);
    this.inputState.pointers.set(e.pointerId, {
      id: e.pointerId,
      x: coords.x,
      y: coords.y,
      pressure: e.pressure,
      isDown: true,
    });
    this.inputState.mouseX = coords.x;
    this.inputState.mouseY = coords.y;
    this.inputState.mouseButtons = e.buttons;
  };

  private handlePointerMove = (e: PointerEvent): void => {
    const coords = this.getCanvasCoords(e);
    const pointer = this.inputState.pointers.get(e.pointerId);
    if (pointer) {
      pointer.x = coords.x;
      pointer.y = coords.y;
      pointer.pressure = e.pressure;
    }
    this.inputState.mouseX = coords.x;
    this.inputState.mouseY = coords.y;
  };

  private handlePointerUp = (e: PointerEvent): void => {
    this.inputState.pointers.delete(e.pointerId);
    this.inputState.mouseButtons = e.buttons;
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.inputState.keys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.inputState.keys.delete(e.code);
  };

  getInput(): InputState {
    return this.inputState;
  }

  isKeyDown(code: string): boolean {
    return this.inputState.keys.has(code);
  }

  isPointerDown(pointerId?: number): boolean {
    if (pointerId !== undefined) {
      return this.inputState.pointers.get(pointerId)?.isDown ?? false;
    }
    return this.inputState.pointers.size > 0;
  }

  // ============================================================================
  // State & Subscription
  // ============================================================================

  getState(): Canvas2DState {
    return { ...this.state };
  }

  subscribe(callback: (state: Canvas2DState) => void): () => void {
    this.subscribers.add(callback);
    callback({ ...this.state });
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(cb => cb({ ...this.state }));
  }
}
