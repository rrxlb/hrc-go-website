// Game types
export type {
  GameConfig,
  GameFeature,
  ShowcaseConfig,
  AnimationSequence,
  InteractiveElement,
  CameraPosition,
  GameTableProps
} from './game';

// Animation types
export type {
  AnimationConfig,
  CameraTransition,
  CameraState,
  LoadingAnimation,
  HoverEffect,
  TransitionConfig,
  MotionVariants
} from './animation';

// Common types
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
  dpr: number;
}

export interface PerformanceMetrics {
  fps: number;
  memory: number;
  drawCalls: number;
  triangles: number;
}