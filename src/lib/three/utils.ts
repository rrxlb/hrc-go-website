import { Vector3, Camera, Object3D } from 'three';
import { CameraPosition } from '@/lib/types';

export const createCameraPosition = (
  x: number,
  y: number,
  z: number,
  targetX = 0,
  targetY = 0,
  targetZ = 0,
  fov = 75
): CameraPosition => ({
  position: new Vector3(x, y, z),
  target: new Vector3(targetX, targetY, targetZ),
  fov
});

export const lerpCameraPosition = (
  from: CameraPosition,
  to: CameraPosition,
  alpha: number
): CameraPosition => ({
  position: from.position.clone().lerp(to.position, alpha),
  target: from.target.clone().lerp(to.target, alpha),
  fov: from.fov && to.fov ? from.fov + (to.fov - from.fov) * alpha : to.fov
});

export const calculateDistance = (pos1: Vector3, pos2: Vector3): number => {
  return pos1.distanceTo(pos2);
};

export const normalizeVector = (vector: Vector3): Vector3 => {
  return vector.clone().normalize();
};

export const clampVector = (
  vector: Vector3,
  min: Vector3,
  max: Vector3
): Vector3 => {
  return vector.clone().clamp(min, max);
};

export const getObjectWorldPosition = (object: Object3D): Vector3 => {
  const worldPosition = new Vector3();
  object.getWorldPosition(worldPosition);
  return worldPosition;
};

export const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

export const isWebGL2Supported = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch (e) {
    return false;
  }
};

export const getDevicePixelRatio = (): number => {
  return Math.min(window.devicePixelRatio || 1, 2);
};