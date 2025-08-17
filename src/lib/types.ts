import { Vector3 } from 'three';

export interface GameFeature {
  title: string;
  description: string;
  icon: string;
  highlight: boolean;
}

export interface InteractiveElement {
  id: string;
  position: [number, number, number];
  action: 'navigate' | 'info' | 'demo';
  target: string;
}

export interface AnimationSequence {
  id: string;
  trigger: 'load' | 'hover' | 'click' | 'scroll';
  duration: number;
  easing: string;
}

export interface ShowcaseConfig {
  tableModel: string;
  cameraPosition: [number, number, number];
  animations: AnimationSequence[];
  interactiveElements: InteractiveElement[];
}

export interface GameConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  features: GameFeature[];
  showcase: ShowcaseConfig;
  discordCommand: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
}

export interface CameraPosition {
  position: Vector3;
  target: Vector3;
  fov?: number;
  gameId?: string;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  isTransitioning?: boolean;
  currentGameId?: string;
}

export interface GameTableProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isHovered?: boolean;
  isClicked?: boolean;
  gameId?: string;
}

export interface MotionVariants {
  initial?: any;
  animate?: any;
  exit?: any;
  hover?: any;
  tap?: any;
  [key: string]: any;
}

export interface TransitionConfig {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: string;
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  restSpeed?: number;
  restDelta?: number;
  direction?: string;
}

export interface AnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
  repeat?: number;
  yoyo?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
  onUpdate?: () => void;
}

export interface CameraTransition {
  from: {
    position: [number, number, number];
    target?: [number, number, number];
    fov?: number;
  };
  to: {
    position: [number, number, number];
    target?: [number, number, number];
    fov?: number;
  };
  duration?: number;
  ease?: string;
  onComplete?: () => void;
}

export interface PerformanceMetrics {
  fps: number;
  memory: number;
  drawCalls: number;
  triangles: number;
}