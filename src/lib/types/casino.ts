import { Vector3 } from 'three';

export interface CameraPosition {
  position: Vector3;
  target: Vector3;
}

export interface CasinoSceneProps {
  className?: string;
  enableControls?: boolean;
  cameraPosition?: CameraPosition;
}

export interface LightingConfig {
  ambientIntensity: number;
  ambientColor: string;
  directionalIntensity: number;
  directionalColor: string;
  pointLightIntensity: number;
  pointLightColor: string;
}

export interface MaterialConfig {
  floorColor: string;
  wallColor: string;
  tableColor: string;
  tableBaseColor: string;
  roughness: number;
  metalness: number;
}