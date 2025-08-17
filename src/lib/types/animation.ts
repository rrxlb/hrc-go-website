import { gsap } from 'gsap';

type Timeline = gsap.core.Timeline;

export interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
  repeat?: number;
  yoyo?: boolean;
}

export interface CameraTransition {
  from: CameraState;
  to: CameraState;
  duration: number;
  ease: string;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface LoadingAnimation {
  type: 'chips' | 'cards' | 'roulette' | 'dice';
  duration: number;
  loop: boolean;
}

export interface HoverEffect {
  scale: number;
  glow: boolean;
  duration: number;
  ease: string;
}

export interface TransitionConfig {
  type: 'fade' | 'slide' | 'scale' | 'rotate';
  duration: number;
  ease: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface MotionVariants {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Record<string, any>;
}