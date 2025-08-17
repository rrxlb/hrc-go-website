import { Vector3 } from 'three';
import { gsap } from 'gsap';

type Timeline = gsap.core.Timeline;

export interface GameConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  features: GameFeature[];
  showcase: ShowcaseConfig;
  discordCommand: string;
}

export interface GameFeature {
  title: string;
  description: string;
  icon: string;
  highlight: boolean;
}

export interface ShowcaseConfig {
  tableModel: string;
  cameraPosition: [number, number, number];
  animations: AnimationSequence[];
  interactiveElements: InteractiveElement[];
}

export interface AnimationSequence {
  id: string;
  trigger: 'load' | 'hover' | 'click' | 'scroll';
  timeline: Timeline;
  duration: number;
  easing: string;
}

export interface InteractiveElement {
  id: string;
  position: [number, number, number];
  action: 'navigate' | 'info' | 'demo';
  target: string;
}

export interface CameraPosition {
  position: Vector3;
  target: Vector3;
  fov?: number;
}

export interface GameTableProps {
  gameId: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
  isHovered?: boolean;
  isClicked?: boolean;
}