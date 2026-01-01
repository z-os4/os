/**
 * WebGL3D - Hardware-accelerated 3D rendering engine
 *
 * Provides a clean API for 3D graphics using WebGL:
 * - Scene graph with meshes, lights, cameras
 * - Built-in geometry primitives (box, sphere, plane, cylinder)
 * - Phong lighting model
 * - Basic materials with textures
 * - Orbit camera controls
 */

import type {
  Vec3,
  Color,
  Transform3D,
  Camera3D,
  Light3D,
  Material,
  Geometry,
  Mesh3D,
  Scene3D,
  WebGLOptions,
  WebGLState,
} from './types';
import * as mat4 from './math';

function generateId(): string {
  return `gl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

function colorToVec4(c: Color): [number, number, number, number] {
  return [c.r / 255, c.g / 255, c.b / 255, c.a];
}

// ============================================================================
// Shaders
// ============================================================================

const VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec2 aTexCoord;

  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uNormalMatrix;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vTexCoord;

  void main() {
    vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
    vPosition = worldPos.xyz;
    vNormal = (uNormalMatrix * vec4(aNormal, 0.0)).xyz;
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vTexCoord;

  uniform vec3 uCameraPosition;
  uniform vec4 uMaterialColor;
  uniform float uMaterialAmbient;
  uniform float uMaterialDiffuse;
  uniform float uMaterialSpecular;
  uniform float uMaterialShininess;
  uniform float uMaterialOpacity;
  uniform bool uUseTexture;
  uniform sampler2D uTexture;

  // Lights (up to 4)
  uniform int uLightCount;
  uniform int uLightTypes[4];
  uniform vec3 uLightPositions[4];
  uniform vec3 uLightDirections[4];
  uniform vec4 uLightColors[4];
  uniform float uLightIntensities[4];
  uniform float uLightRanges[4];

  uniform vec4 uAmbientLight;
  uniform vec4 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform bool uUseFog;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uCameraPosition - vPosition);

    // Base color
    vec4 baseColor = uMaterialColor;
    if (uUseTexture) {
      baseColor *= texture2D(uTexture, vTexCoord);
    }

    // Ambient
    vec3 ambient = uMaterialAmbient * uAmbientLight.rgb * baseColor.rgb;

    // Lighting accumulation
    vec3 diffuseAccum = vec3(0.0);
    vec3 specularAccum = vec3(0.0);

    for (int i = 0; i < 4; i++) {
      if (i >= uLightCount) break;

      vec3 lightColor = uLightColors[i].rgb * uLightIntensities[i];
      vec3 lightDir;
      float attenuation = 1.0;

      if (uLightTypes[i] == 0) {
        // Ambient light (already handled)
        continue;
      } else if (uLightTypes[i] == 1) {
        // Directional light
        lightDir = normalize(-uLightDirections[i]);
      } else {
        // Point or spot light
        vec3 toLight = uLightPositions[i] - vPosition;
        float distance = length(toLight);
        lightDir = toLight / distance;

        // Attenuation
        if (uLightRanges[i] > 0.0) {
          attenuation = clamp(1.0 - distance / uLightRanges[i], 0.0, 1.0);
          attenuation *= attenuation;
        }
      }

      // Diffuse
      float diff = max(dot(normal, lightDir), 0.0);
      diffuseAccum += uMaterialDiffuse * diff * lightColor * attenuation;

      // Specular (Blinn-Phong)
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), uMaterialShininess);
      specularAccum += uMaterialSpecular * spec * lightColor * attenuation;
    }

    vec3 finalColor = ambient + diffuseAccum * baseColor.rgb + specularAccum;

    // Fog
    if (uUseFog) {
      float depth = length(uCameraPosition - vPosition);
      float fogFactor = clamp((uFogFar - depth) / (uFogFar - uFogNear), 0.0, 1.0);
      finalColor = mix(uFogColor.rgb, finalColor, fogFactor);
    }

    float alpha = baseColor.a * uMaterialOpacity;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ============================================================================
// WebGL3DEngine
// ============================================================================

export class WebGL3DEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;

  private state: WebGLState;
  private scenes: Map<string, Scene3D> = new Map();
  private activeSceneId: string | null = null;
  private geometryBuffers: Map<string, { vao: WebGLBuffer; ibo?: WebGLBuffer; count: number }> = new Map();
  private textures: Map<string, WebGLTexture> = new Map();

  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCallback: ((dt: number) => void) | null = null;
  private subscribers: Set<(state: WebGLState) => void> = new Set();

  // Uniforms
  private uniforms: Record<string, WebGLUniformLocation> = {};
  private attributes: Record<string, number> = {};

  constructor(canvas: HTMLCanvasElement, options: WebGLOptions) {
    this.canvas = canvas;

    const gl = canvas.getContext('webgl', {
      alpha: options.alpha ?? true,
      antialias: options.antialias ?? true,
      depth: options.depth ?? true,
      stencil: options.stencil ?? false,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
    });

    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    const pixelRatio = options.pixelRatio ?? window.devicePixelRatio ?? 1;

    this.state = {
      width: options.width,
      height: options.height,
      pixelRatio,
      fps: 0,
      frameCount: 0,
      deltaTime: 0,
      running: false,
      drawCalls: 0,
      triangles: 0,
    };

    // Initialize shaders
    this.program = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    gl.useProgram(this.program);

    // Get uniform/attribute locations
    this.uniforms = {
      modelMatrix: gl.getUniformLocation(this.program, 'uModelMatrix')!,
      viewMatrix: gl.getUniformLocation(this.program, 'uViewMatrix')!,
      projectionMatrix: gl.getUniformLocation(this.program, 'uProjectionMatrix')!,
      normalMatrix: gl.getUniformLocation(this.program, 'uNormalMatrix')!,
      cameraPosition: gl.getUniformLocation(this.program, 'uCameraPosition')!,
      materialColor: gl.getUniformLocation(this.program, 'uMaterialColor')!,
      materialAmbient: gl.getUniformLocation(this.program, 'uMaterialAmbient')!,
      materialDiffuse: gl.getUniformLocation(this.program, 'uMaterialDiffuse')!,
      materialSpecular: gl.getUniformLocation(this.program, 'uMaterialSpecular')!,
      materialShininess: gl.getUniformLocation(this.program, 'uMaterialShininess')!,
      materialOpacity: gl.getUniformLocation(this.program, 'uMaterialOpacity')!,
      useTexture: gl.getUniformLocation(this.program, 'uUseTexture')!,
      texture: gl.getUniformLocation(this.program, 'uTexture')!,
      lightCount: gl.getUniformLocation(this.program, 'uLightCount')!,
      ambientLight: gl.getUniformLocation(this.program, 'uAmbientLight')!,
      fogColor: gl.getUniformLocation(this.program, 'uFogColor')!,
      fogNear: gl.getUniformLocation(this.program, 'uFogNear')!,
      fogFar: gl.getUniformLocation(this.program, 'uFogFar')!,
      useFog: gl.getUniformLocation(this.program, 'uUseFog')!,
    };

    this.attributes = {
      position: gl.getAttribLocation(this.program, 'aPosition'),
      normal: gl.getAttribLocation(this.program, 'aNormal'),
      texCoord: gl.getAttribLocation(this.program, 'aTexCoord'),
    };

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Enable backface culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.resize(options.width, options.height);
  }

  // ============================================================================
  // Shader Compilation
  // ============================================================================

  private createShader(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation failed: ${log}`);
    }

    return shader;
  }

  private createProgram(vertexSrc: string, fragmentSrc: string): WebGLProgram {
    const { gl } = this;
    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create program');

    const vs = this.createShader(gl.VERTEX_SHADER, vertexSrc);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fragmentSrc);

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program linking failed: ${log}`);
    }

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    return program;
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

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

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
    this.state.drawCalls = 0;
    this.state.triangles = 0;

    this.frameCallback?.(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  destroy(): void {
    this.stop();
    this.gl.deleteProgram(this.program);
    this.geometryBuffers.forEach((buf) => {
      this.gl.deleteBuffer(buf.vao);
      if (buf.ibo) this.gl.deleteBuffer(buf.ibo);
    });
    this.textures.forEach((tex) => this.gl.deleteTexture(tex));
    this.scenes.clear();
    this.subscribers.clear();
  }

  // ============================================================================
  // Scene Management
  // ============================================================================

  createScene(name: string): Scene3D {
    const scene: Scene3D = {
      id: generateId(),
      name,
      meshes: [],
      lights: [],
      camera: this.createCamera(),
      background: { r: 30, g: 30, b: 40, a: 1 },
    };
    this.scenes.set(scene.id, scene);
    if (!this.activeSceneId) this.activeSceneId = scene.id;
    return scene;
  }

  getScene(sceneId: string): Scene3D | undefined {
    return this.scenes.get(sceneId);
  }

  setActiveScene(sceneId: string): void {
    if (this.scenes.has(sceneId)) {
      this.activeSceneId = sceneId;
    }
  }

  getActiveScene(): Scene3D | undefined {
    return this.activeSceneId ? this.scenes.get(this.activeSceneId) : undefined;
  }

  // ============================================================================
  // Camera
  // ============================================================================

  createCamera(options?: Partial<Camera3D>): Camera3D {
    return {
      id: generateId(),
      type: options?.type ?? 'perspective',
      position: options?.position ?? { x: 0, y: 2, z: 5 },
      target: options?.target ?? { x: 0, y: 0, z: 0 },
      up: options?.up ?? { x: 0, y: 1, z: 0 },
      fov: options?.fov ?? Math.PI / 4,
      near: options?.near ?? 0.1,
      far: options?.far ?? 1000,
      zoom: options?.zoom ?? 1,
    };
  }

  // ============================================================================
  // Lights
  // ============================================================================

  addAmbientLight(scene: Scene3D, color: Color, intensity: number = 0.3): Light3D {
    const light: Light3D = {
      id: generateId(),
      type: 'ambient',
      color,
      intensity,
    };
    scene.lights.push(light);
    return light;
  }

  addDirectionalLight(scene: Scene3D, direction: Vec3, color: Color, intensity: number = 1): Light3D {
    const light: Light3D = {
      id: generateId(),
      type: 'directional',
      color,
      intensity,
      direction,
    };
    scene.lights.push(light);
    return light;
  }

  addPointLight(scene: Scene3D, position: Vec3, color: Color, intensity: number = 1, range: number = 10): Light3D {
    const light: Light3D = {
      id: generateId(),
      type: 'point',
      color,
      intensity,
      position,
      range,
    };
    scene.lights.push(light);
    return light;
  }

  // ============================================================================
  // Materials
  // ============================================================================

  createMaterial(options?: Partial<Material>): Material {
    return {
      id: generateId(),
      name: options?.name ?? 'Material',
      color: options?.color ?? { r: 200, g: 200, b: 200, a: 1 },
      ambient: options?.ambient ?? 0.3,
      diffuse: options?.diffuse ?? 0.7,
      specular: options?.specular ?? 0.5,
      shininess: options?.shininess ?? 32,
      opacity: options?.opacity ?? 1,
      wireframe: options?.wireframe ?? false,
      doubleSided: options?.doubleSided ?? false,
    };
  }

  // ============================================================================
  // Geometry Primitives
  // ============================================================================

  createBoxGeometry(width: number = 1, height: number = 1, depth: number = 1): Geometry {
    const hw = width / 2, hh = height / 2, hd = depth / 2;

    // prettier-ignore
    const vertices = new Float32Array([
      // Front
      -hw, -hh,  hd,   hw, -hh,  hd,   hw,  hh,  hd,  -hw,  hh,  hd,
      // Back
       hw, -hh, -hd,  -hw, -hh, -hd,  -hw,  hh, -hd,   hw,  hh, -hd,
      // Top
      -hw,  hh,  hd,   hw,  hh,  hd,   hw,  hh, -hd,  -hw,  hh, -hd,
      // Bottom
      -hw, -hh, -hd,   hw, -hh, -hd,   hw, -hh,  hd,  -hw, -hh,  hd,
      // Right
       hw, -hh,  hd,   hw, -hh, -hd,   hw,  hh, -hd,   hw,  hh,  hd,
      // Left
      -hw, -hh, -hd,  -hw, -hh,  hd,  -hw,  hh,  hd,  -hw,  hh, -hd,
    ]);

    // prettier-ignore
    const normals = new Float32Array([
      0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
      0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,
      0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
      0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
      1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
     -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ]);

    // prettier-ignore
    const uvs = new Float32Array([
      0, 0, 1, 0, 1, 1, 0, 1,
      0, 0, 1, 0, 1, 1, 0, 1,
      0, 0, 1, 0, 1, 1, 0, 1,
      0, 0, 1, 0, 1, 1, 0, 1,
      0, 0, 1, 0, 1, 1, 0, 1,
      0, 0, 1, 0, 1, 1, 0, 1,
    ]);

    // prettier-ignore
    const indices = new Uint16Array([
       0,  1,  2,  0,  2,  3,  // Front
       4,  5,  6,  4,  6,  7,  // Back
       8,  9, 10,  8, 10, 11,  // Top
      12, 13, 14, 12, 14, 15,  // Bottom
      16, 17, 18, 16, 18, 19,  // Right
      20, 21, 22, 20, 22, 23,  // Left
    ]);

    const geo: Geometry = {
      id: generateId(),
      vertices,
      normals,
      uvs,
      indices,
      vertexCount: 24,
    };

    this.uploadGeometry(geo);
    return geo;
  }

  createPlaneGeometry(width: number = 1, height: number = 1, widthSegments: number = 1, heightSegments: number = 1): Geometry {
    const hw = width / 2;
    const hh = height / 2;
    const gridX = widthSegments;
    const gridY = heightSegments;
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy / gridY;
      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix / gridX;
        vertices.push(x * width - hw, 0, y * height - hh);
        normals.push(0, 1, 0);
        uvs.push(x, 1 - y);
      }
    }

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * (iy + 1);
        const c = ix + 1 + gridX1 * (iy + 1);
        const d = ix + 1 + gridX1 * iy;
        indices.push(a, b, d, b, c, d);
      }
    }

    const geo: Geometry = {
      id: generateId(),
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices),
      vertexCount: gridX1 * gridY1,
    };

    this.uploadGeometry(geo);
    return geo;
  }

  createSphereGeometry(radius: number = 0.5, widthSegments: number = 32, heightSegments: number = 16): Geometry {
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments;
      const phi = v * Math.PI;

      for (let ix = 0; ix <= widthSegments; ix++) {
        const u = ix / widthSegments;
        const theta = u * Math.PI * 2;

        const x = -radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(theta) * Math.sin(phi);

        vertices.push(x, y, z);
        normals.push(x / radius, y / radius, z / radius);
        uvs.push(u, 1 - v);
      }
    }

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < widthSegments; ix++) {
        const a = ix + (widthSegments + 1) * iy;
        const b = ix + (widthSegments + 1) * (iy + 1);
        const c = ix + 1 + (widthSegments + 1) * (iy + 1);
        const d = ix + 1 + (widthSegments + 1) * iy;

        if (iy !== 0) indices.push(a, b, d);
        if (iy !== heightSegments - 1) indices.push(b, c, d);
      }
    }

    const geo: Geometry = {
      id: generateId(),
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices),
      vertexCount: (widthSegments + 1) * (heightSegments + 1),
    };

    this.uploadGeometry(geo);
    return geo;
  }

  createCylinderGeometry(radiusTop: number = 0.5, radiusBottom: number = 0.5, height: number = 1, segments: number = 32): Geometry {
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const halfHeight = height / 2;

    // Side
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const theta = u * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      // Top vertex
      vertices.push(cos * radiusTop, halfHeight, sin * radiusTop);
      normals.push(cos, 0, sin);
      uvs.push(u, 0);

      // Bottom vertex
      vertices.push(cos * radiusBottom, -halfHeight, sin * radiusBottom);
      normals.push(cos, 0, sin);
      uvs.push(u, 1);
    }

    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2 + 1;
      const d = (i + 1) * 2;
      indices.push(a, b, d, b, c, d);
    }

    // Top cap
    const topCenterIdx = vertices.length / 3;
    vertices.push(0, halfHeight, 0);
    normals.push(0, 1, 0);
    uvs.push(0.5, 0.5);

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      vertices.push(cos * radiusTop, halfHeight, sin * radiusTop);
      normals.push(0, 1, 0);
      uvs.push(cos * 0.5 + 0.5, sin * 0.5 + 0.5);
    }

    for (let i = 0; i < segments; i++) {
      indices.push(topCenterIdx, topCenterIdx + i + 1, topCenterIdx + i + 2);
    }

    // Bottom cap
    const bottomCenterIdx = vertices.length / 3;
    vertices.push(0, -halfHeight, 0);
    normals.push(0, -1, 0);
    uvs.push(0.5, 0.5);

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      vertices.push(cos * radiusBottom, -halfHeight, sin * radiusBottom);
      normals.push(0, -1, 0);
      uvs.push(cos * 0.5 + 0.5, sin * 0.5 + 0.5);
    }

    for (let i = 0; i < segments; i++) {
      indices.push(bottomCenterIdx, bottomCenterIdx + i + 2, bottomCenterIdx + i + 1);
    }

    const geo: Geometry = {
      id: generateId(),
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices),
      vertexCount: vertices.length / 3,
    };

    this.uploadGeometry(geo);
    return geo;
  }

  private uploadGeometry(geometry: Geometry): void {
    const { gl } = this;

    // Create and populate vertex buffer
    const vbo = gl.createBuffer();
    if (!vbo) throw new Error('Failed to create buffer');

    // Interleave position + normal + uv
    const stride = 8; // 3 pos + 3 normal + 2 uv
    const interleavedData = new Float32Array(geometry.vertexCount * stride);

    for (let i = 0; i < geometry.vertexCount; i++) {
      const offset = i * stride;
      interleavedData[offset] = geometry.vertices[i * 3];
      interleavedData[offset + 1] = geometry.vertices[i * 3 + 1];
      interleavedData[offset + 2] = geometry.vertices[i * 3 + 2];

      if (geometry.normals) {
        interleavedData[offset + 3] = geometry.normals[i * 3];
        interleavedData[offset + 4] = geometry.normals[i * 3 + 1];
        interleavedData[offset + 5] = geometry.normals[i * 3 + 2];
      }

      if (geometry.uvs) {
        interleavedData[offset + 6] = geometry.uvs[i * 2];
        interleavedData[offset + 7] = geometry.uvs[i * 2 + 1];
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, interleavedData, gl.STATIC_DRAW);

    let ibo: WebGLBuffer | undefined;
    let count = geometry.vertexCount;

    if (geometry.indices) {
      ibo = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
      count = geometry.indices.length;
    }

    this.geometryBuffers.set(geometry.id, { vao: vbo, ibo, count });
  }

  // ============================================================================
  // Mesh Creation
  // ============================================================================

  createMesh(geometry: Geometry, material: Material, transform?: Partial<Transform3D>): Mesh3D {
    return {
      id: generateId(),
      name: 'Mesh',
      geometry,
      material,
      transform: {
        position: transform?.position ?? { x: 0, y: 0, z: 0 },
        rotation: transform?.rotation ?? { x: 0, y: 0, z: 0 },
        scale: transform?.scale ?? { x: 1, y: 1, z: 1 },
      },
      visible: true,
    };
  }

  addMesh(scene: Scene3D, mesh: Mesh3D): Mesh3D {
    scene.meshes.push(mesh);
    return mesh;
  }

  // ============================================================================
  // Textures
  // ============================================================================

  async loadTexture(src: string): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const texture = this.createTextureFromImage(image);
        resolve(texture);
      };
      image.onerror = () => reject(new Error(`Failed to load texture: ${src}`));
      image.src = src;
    });
  }

  private createTextureFromImage(image: HTMLImageElement): WebGLTexture {
    const { gl } = this;
    const texture = gl.createTexture();
    if (!texture) throw new Error('Failed to create texture');

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Check if power of 2
    const isPOT = (v: number) => (v & (v - 1)) === 0;
    if (isPOT(image.width) && isPOT(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.textures.set(generateId(), texture);
    return texture;
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  private render(): void {
    const scene = this.getActiveScene();
    if (!scene) return;

    const { gl } = this;
    const { width, height, pixelRatio } = this.state;
    const { camera, background } = scene;

    // Clear
    const [r, g, b, a] = colorToVec4(background);
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Build matrices
    const aspect = (width * pixelRatio) / (height * pixelRatio);
    const projectionMatrix = camera.type === 'perspective'
      ? mat4.perspective(camera.fov, aspect, camera.near, camera.far)
      : mat4.orthographic(-aspect * camera.zoom, aspect * camera.zoom, -camera.zoom, camera.zoom, camera.near, camera.far);

    const viewMatrix = mat4.lookAt(camera.position, camera.target, camera.up);

    gl.uniformMatrix4fv(this.uniforms.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, viewMatrix);
    gl.uniform3f(this.uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z);

    // Setup lights
    this.setupLights(scene);

    // Render meshes
    for (const mesh of scene.meshes) {
      if (!mesh.visible) continue;
      this.renderMesh(mesh);
    }
  }

  private setupLights(scene: Scene3D): void {
    const { gl } = this;
    const lights = scene.lights.slice(0, 4);

    // Find ambient light
    const ambientLight = lights.find(l => l.type === 'ambient');
    if (ambientLight) {
      const [r, g, b] = colorToVec4(ambientLight.color);
      gl.uniform4f(this.uniforms.ambientLight, r * ambientLight.intensity, g * ambientLight.intensity, b * ambientLight.intensity, 1);
    } else {
      gl.uniform4f(this.uniforms.ambientLight, 0.1, 0.1, 0.1, 1);
    }

    const nonAmbientLights = lights.filter(l => l.type !== 'ambient');
    gl.uniform1i(this.uniforms.lightCount, nonAmbientLights.length);

    for (let i = 0; i < 4; i++) {
      const light = nonAmbientLights[i];
      const typeUniform = gl.getUniformLocation(this.program, `uLightTypes[${i}]`);
      const posUniform = gl.getUniformLocation(this.program, `uLightPositions[${i}]`);
      const dirUniform = gl.getUniformLocation(this.program, `uLightDirections[${i}]`);
      const colorUniform = gl.getUniformLocation(this.program, `uLightColors[${i}]`);
      const intensityUniform = gl.getUniformLocation(this.program, `uLightIntensities[${i}]`);
      const rangeUniform = gl.getUniformLocation(this.program, `uLightRanges[${i}]`);

      if (light) {
        const typeMap = { ambient: 0, directional: 1, point: 2, spot: 3 };
        gl.uniform1i(typeUniform, typeMap[light.type]);

        const [r, g, b, a] = colorToVec4(light.color);
        gl.uniform4f(colorUniform, r, g, b, a);
        gl.uniform1f(intensityUniform, light.intensity);
        gl.uniform1f(rangeUniform, light.range ?? 0);

        if (light.position) {
          gl.uniform3f(posUniform, light.position.x, light.position.y, light.position.z);
        }
        if (light.direction) {
          gl.uniform3f(dirUniform, light.direction.x, light.direction.y, light.direction.z);
        }
      } else {
        gl.uniform1i(typeUniform, 0);
      }
    }

    // Fog
    if (scene.fog) {
      gl.uniform1i(this.uniforms.useFog, 1);
      const [r, g, b, a] = colorToVec4(scene.fog.color);
      gl.uniform4f(this.uniforms.fogColor, r, g, b, a);
      gl.uniform1f(this.uniforms.fogNear, scene.fog.near);
      gl.uniform1f(this.uniforms.fogFar, scene.fog.far);
    } else {
      gl.uniform1i(this.uniforms.useFog, 0);
    }
  }

  private renderMesh(mesh: Mesh3D): void {
    const { gl } = this;
    const buffer = this.geometryBuffers.get(mesh.geometry.id);
    if (!buffer) return;

    // Build model matrix
    const { position, rotation, scale } = mesh.transform;
    let modelMatrix = mat4.identity();
    modelMatrix = mat4.multiply(modelMatrix, mat4.translate(position.x, position.y, position.z));
    modelMatrix = mat4.multiply(modelMatrix, mat4.rotateX(rotation.x));
    modelMatrix = mat4.multiply(modelMatrix, mat4.rotateY(rotation.y));
    modelMatrix = mat4.multiply(modelMatrix, mat4.rotateZ(rotation.z));
    modelMatrix = mat4.multiply(modelMatrix, mat4.scale(scale.x, scale.y, scale.z));

    // Normal matrix (inverse transpose of model matrix)
    const normalMatrix = mat4.transpose(mat4.invert(modelMatrix) ?? mat4.identity());

    gl.uniformMatrix4fv(this.uniforms.modelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(this.uniforms.normalMatrix, false, normalMatrix);

    // Material
    const { material } = mesh;
    const [r, g, b, a] = colorToVec4(material.color);
    gl.uniform4f(this.uniforms.materialColor, r, g, b, a);
    gl.uniform1f(this.uniforms.materialAmbient, material.ambient);
    gl.uniform1f(this.uniforms.materialDiffuse, material.diffuse);
    gl.uniform1f(this.uniforms.materialSpecular, material.specular);
    gl.uniform1f(this.uniforms.materialShininess, material.shininess);
    gl.uniform1f(this.uniforms.materialOpacity, material.opacity);

    // Texture
    if (material.texture) {
      gl.uniform1i(this.uniforms.useTexture, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, material.texture);
      gl.uniform1i(this.uniforms.texture, 0);
    } else {
      gl.uniform1i(this.uniforms.useTexture, 0);
    }

    // Double-sided
    if (material.doubleSided) {
      gl.disable(gl.CULL_FACE);
    } else {
      gl.enable(gl.CULL_FACE);
    }

    // Bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vao);

    const stride = 32; // 8 floats * 4 bytes
    gl.enableVertexAttribArray(this.attributes.position);
    gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(this.attributes.normal);
    gl.vertexAttribPointer(this.attributes.normal, 3, gl.FLOAT, false, stride, 12);

    gl.enableVertexAttribArray(this.attributes.texCoord);
    gl.vertexAttribPointer(this.attributes.texCoord, 2, gl.FLOAT, false, stride, 24);

    // Draw
    if (buffer.ibo) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ibo);
      const mode = material.wireframe ? gl.LINES : gl.TRIANGLES;
      gl.drawElements(mode, buffer.count, gl.UNSIGNED_SHORT, 0);
      this.state.triangles += buffer.count / 3;
    } else {
      const mode = material.wireframe ? gl.LINES : gl.TRIANGLES;
      gl.drawArrays(mode, 0, buffer.count);
      this.state.triangles += buffer.count / 3;
    }

    this.state.drawCalls++;
  }

  // ============================================================================
  // State & Subscription
  // ============================================================================

  getState(): WebGLState {
    return { ...this.state };
  }

  subscribe(callback: (state: WebGLState) => void): () => void {
    this.subscribers.add(callback);
    callback({ ...this.state });
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(cb => cb({ ...this.state }));
  }
}
