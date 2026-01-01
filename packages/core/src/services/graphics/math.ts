/**
 * Graphics Math Utilities
 *
 * Matrix operations for 3D transformations.
 * Uses column-major order (WebGL standard).
 */

import type { Vec3, Vec4 } from './types';

export type Mat4 = Float32Array;

// ============================================================================
// Matrix Creation
// ============================================================================

export function createMat4(): Mat4 {
  return new Float32Array(16);
}

export function identity(): Mat4 {
  const m = createMat4();
  m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
  return m;
}

export function copy(m: Mat4): Mat4 {
  return new Float32Array(m);
}

// ============================================================================
// Matrix Operations
// ============================================================================

export function multiply(a: Mat4, b: Mat4, out?: Mat4): Mat4 {
  const result = out ?? createMat4();

  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
  const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
  const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
  const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

  result[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  result[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  result[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  result[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;

  result[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  result[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  result[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  result[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;

  result[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  result[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  result[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  result[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;

  result[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  result[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  result[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  result[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

  return result;
}

export function invert(m: Mat4, out?: Mat4): Mat4 | null {
  const result = out ?? createMat4();

  const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
  const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
  const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
  const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

  const tmp0 = m22 * m33 - m32 * m23;
  const tmp1 = m21 * m33 - m31 * m23;
  const tmp2 = m21 * m32 - m31 * m22;
  const tmp3 = m20 * m33 - m30 * m23;
  const tmp4 = m20 * m32 - m30 * m22;
  const tmp5 = m20 * m31 - m30 * m21;

  const t0 = tmp0 * m11 - tmp1 * m12 + tmp2 * m13;
  const t1 = -(tmp0 * m10 - tmp3 * m12 + tmp4 * m13);
  const t2 = tmp1 * m10 - tmp3 * m11 + tmp5 * m13;
  const t3 = -(tmp2 * m10 - tmp4 * m11 + tmp5 * m12);

  const det = m00 * t0 + m01 * t1 + m02 * t2 + m03 * t3;
  if (Math.abs(det) < 1e-10) return null;

  const invDet = 1 / det;

  result[0] = t0 * invDet;
  result[1] = -(tmp0 * m01 - tmp1 * m02 + tmp2 * m03) * invDet;
  result[2] = (tmp0 * m01 - tmp3 * m02 + tmp4 * m03) * invDet;
  result[3] = -(tmp1 * m01 - tmp3 * m01 + tmp5 * m03) * invDet;

  result[4] = t1 * invDet;
  result[5] = (tmp0 * m00 - tmp1 * m02 + tmp2 * m03) * invDet;
  result[6] = -(tmp0 * m00 - tmp3 * m02 + tmp4 * m03) * invDet;
  result[7] = (tmp1 * m00 - tmp3 * m01 + tmp5 * m03) * invDet;

  result[8] = t2 * invDet;
  result[9] = -(tmp0 * m00 - tmp1 * m01 + tmp2 * m03) * invDet;
  result[10] = (tmp0 * m00 - tmp3 * m01 + tmp4 * m03) * invDet;
  result[11] = -(tmp1 * m00 - tmp3 * m01 + tmp5 * m02) * invDet;

  result[12] = t3 * invDet;
  result[13] = (tmp2 * m00 - tmp4 * m01 + tmp5 * m02) * invDet;
  result[14] = -(tmp1 * m00 - tmp3 * m01 + tmp5 * m02) * invDet;
  result[15] = (tmp0 * m00 - tmp4 * m01 + tmp5 * m02) * invDet;

  return result;
}

export function transpose(m: Mat4, out?: Mat4): Mat4 {
  const result = out ?? createMat4();

  result[0] = m[0]; result[1] = m[4]; result[2] = m[8]; result[3] = m[12];
  result[4] = m[1]; result[5] = m[5]; result[6] = m[9]; result[7] = m[13];
  result[8] = m[2]; result[9] = m[6]; result[10] = m[10]; result[11] = m[14];
  result[12] = m[3]; result[13] = m[7]; result[14] = m[11]; result[15] = m[15];

  return result;
}

// ============================================================================
// Transformation Matrices
// ============================================================================

export function translate(x: number, y: number, z: number, out?: Mat4): Mat4 {
  const m = out ?? identity();
  if (!out) {
    m[12] = x; m[13] = y; m[14] = z;
    return m;
  }
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
}

export function scale(x: number, y: number, z: number, out?: Mat4): Mat4 {
  const m = out ?? createMat4();
  m[0] = x; m[5] = y; m[10] = z; m[15] = 1;
  return m;
}

export function rotateX(angle: number, out?: Mat4): Mat4 {
  const m = out ?? identity();
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = c; m[6] = s; m[7] = 0;
  m[8] = 0; m[9] = -s; m[10] = c; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;

  return m;
}

export function rotateY(angle: number, out?: Mat4): Mat4 {
  const m = out ?? identity();
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  m[0] = c; m[1] = 0; m[2] = -s; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = s; m[9] = 0; m[10] = c; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;

  return m;
}

export function rotateZ(angle: number, out?: Mat4): Mat4 {
  const m = out ?? identity();
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  m[0] = c; m[1] = s; m[2] = 0; m[3] = 0;
  m[4] = -s; m[5] = c; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;

  return m;
}

// ============================================================================
// Projection Matrices
// ============================================================================

export function perspective(fov: number, aspect: number, near: number, far: number, out?: Mat4): Mat4 {
  const m = out ?? createMat4();
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);

  m[0] = f / aspect;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;

  m[4] = 0;
  m[5] = f;
  m[6] = 0;
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = (far + near) * nf;
  m[11] = -1;

  m[12] = 0;
  m[13] = 0;
  m[14] = 2 * far * near * nf;
  m[15] = 0;

  return m;
}

export function orthographic(
  left: number, right: number,
  bottom: number, top: number,
  near: number, far: number,
  out?: Mat4
): Mat4 {
  const m = out ?? createMat4();
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);

  m[0] = -2 * lr;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;

  m[4] = 0;
  m[5] = -2 * bt;
  m[6] = 0;
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = 2 * nf;
  m[11] = 0;

  m[12] = (left + right) * lr;
  m[13] = (top + bottom) * bt;
  m[14] = (far + near) * nf;
  m[15] = 1;

  return m;
}

export function lookAt(eye: Vec3, target: Vec3, up: Vec3, out?: Mat4): Mat4 {
  const m = out ?? createMat4();

  let zx = eye.x - target.x;
  let zy = eye.y - target.y;
  let zz = eye.z - target.z;

  let len = Math.sqrt(zx * zx + zy * zy + zz * zz);
  if (len > 0) {
    len = 1 / len;
    zx *= len;
    zy *= len;
    zz *= len;
  }

  let xx = up.y * zz - up.z * zy;
  let xy = up.z * zx - up.x * zz;
  let xz = up.x * zy - up.y * zx;

  len = Math.sqrt(xx * xx + xy * xy + xz * xz);
  if (len > 0) {
    len = 1 / len;
    xx *= len;
    xy *= len;
    xz *= len;
  }

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  m[0] = xx; m[1] = yx; m[2] = zx; m[3] = 0;
  m[4] = xy; m[5] = yy; m[6] = zy; m[7] = 0;
  m[8] = xz; m[9] = yz; m[10] = zz; m[11] = 0;
  m[12] = -(xx * eye.x + xy * eye.y + xz * eye.z);
  m[13] = -(yx * eye.x + yy * eye.y + yz * eye.z);
  m[14] = -(zx * eye.x + zy * eye.y + zz * eye.z);
  m[15] = 1;

  return m;
}

// ============================================================================
// Vector Operations
// ============================================================================

export function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vec3Scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vec3Length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function vec3Normalize(v: Vec3): Vec3 {
  const len = vec3Length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function vec3Lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

export function transformVec3(v: Vec3, m: Mat4): Vec3 {
  const w = m[3] * v.x + m[7] * v.y + m[11] * v.z + m[15];
  return {
    x: (m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12]) / w,
    y: (m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13]) / w,
    z: (m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14]) / w,
  };
}

// ============================================================================
// Utility
// ============================================================================

export function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}

export function radToDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
