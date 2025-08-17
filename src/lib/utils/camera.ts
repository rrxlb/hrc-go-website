import { Vector3, MathUtils } from 'three';
import { CameraState } from '@/lib/types';

/**
 * Calculate the distance between two 3D points
 */
export function calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Interpolate between two camera states
 */
export function lerpCameraState(from: CameraState, to: CameraState, t: number): CameraState {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  
  return {
    position: [
      lerp(from.position[0], to.position[0], t),
      lerp(from.position[1], to.position[1], t),
      lerp(from.position[2], to.position[2], t)
    ],
    target: [
      lerp(from.target[0], to.target[0], t),
      lerp(from.target[1], to.target[1], t),
      lerp(from.target[2], to.target[2], t)
    ],
    fov: from.fov && to.fov ? lerp(from.fov, to.fov, t) : from.fov || to.fov
  };
}

/**
 * Apply constraints to camera position to keep it within bounds
 */
export function applyCameraConstraints(
  position: Vector3,
  constraints: {
    minHeight: number;
    maxHeight: number;
    boundaryRadius: number;
    centerPoint?: Vector3;
  }
): Vector3 {
  const { minHeight, maxHeight, boundaryRadius, centerPoint = new Vector3(0, 0, 0) } = constraints;
  
  // Clone position to avoid modifying original
  const constrainedPosition = position.clone();
  
  // Apply height constraints
  constrainedPosition.y = MathUtils.clamp(constrainedPosition.y, minHeight, maxHeight);
  
  // Apply boundary radius constraint
  const distanceFromCenter = constrainedPosition.distanceTo(new Vector3(centerPoint.x, constrainedPosition.y, centerPoint.z));
  if (distanceFromCenter > boundaryRadius) {
    const direction = constrainedPosition.clone().sub(new Vector3(centerPoint.x, constrainedPosition.y, centerPoint.z)).normalize();
    constrainedPosition.copy(new Vector3(centerPoint.x, constrainedPosition.y, centerPoint.z).add(direction.multiplyScalar(boundaryRadius)));
  }
  
  return constrainedPosition;
}

/**
 * Calculate optimal camera position for viewing a target
 */
export function calculateOptimalCameraPosition(
  target: Vector3,
  distance: number = 3,
  height: number = 1.6,
  angle: number = 0
): CameraState {
  const x = target.x + Math.sin(angle) * distance;
  const z = target.z + Math.cos(angle) * distance;
  
  return {
    position: [x, height, z],
    target: [target.x, target.y, target.z],
    fov: 75
  };
}

/**
 * Create a smooth camera path between multiple points
 */
export function createCameraPath(points: CameraState[], smoothness: number = 0.5): CameraState[] {
  if (points.length < 2) return points;
  
  const path: CameraState[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    
    // Add current point
    path.push(current);
    
    // Add interpolated points for smoothness
    const steps = Math.ceil(calculateDistance(current.position, next.position) * smoothness);
    for (let step = 1; step < steps; step++) {
      const t = step / steps;
      path.push(lerpCameraState(current, next, t));
    }
  }
  
  // Add final point
  path.push(points[points.length - 1]);
  
  return path;
}

/**
 * Check if a camera position has a clear line of sight to target
 */
export function hasLineOfSight(
  cameraPos: Vector3,
  target: Vector3,
  obstacles: Vector3[] = []
): boolean {
  // Simple line of sight check - can be enhanced with raycasting
  const direction = target.clone().sub(cameraPos).normalize();
  const distance = cameraPos.distanceTo(target);
  
  // Check if any obstacles are in the way
  for (const obstacle of obstacles) {
    const toObstacle = obstacle.clone().sub(cameraPos);
    const projectionLength = toObstacle.dot(direction);
    
    if (projectionLength > 0 && projectionLength < distance) {
      const projection = direction.clone().multiplyScalar(projectionLength);
      const distanceToLine = toObstacle.clone().sub(projection).length();
      
      if (distanceToLine < 0.5) { // Obstacle radius
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Generate camera positions around a circular path
 */
export function generateCircularCameraPositions(
  center: Vector3,
  radius: number,
  height: number,
  count: number
): CameraState[] {
  const positions: CameraState[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = center.x + Math.cos(angle) * radius;
    const z = center.z + Math.sin(angle) * radius;
    
    positions.push({
      position: [x, height, z],
      target: [center.x, center.y, center.z],
      fov: 75
    });
  }
  
  return positions;
}

/**
 * Smooth camera movement with easing
 */
export function easeCameraMovement(
  from: Vector3,
  to: Vector3,
  progress: number,
  easeType: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' = 'easeInOut'
): Vector3 {
  let t = progress;
  
  switch (easeType) {
    case 'easeIn':
      t = t * t;
      break;
    case 'easeOut':
      t = 1 - (1 - t) * (1 - t);
      break;
    case 'easeInOut':
      t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      break;
    default:
      // linear - no change to t
      break;
  }
  
  return from.clone().lerp(to, t);
}