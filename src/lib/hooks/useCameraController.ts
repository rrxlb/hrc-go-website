'use client';

import { useCallback, useRef } from 'react';
import { Vector3 } from 'three';
import { gsap } from 'gsap';
import { CameraState } from '@/lib/types';
import { CAMERA_POSITIONS } from '@/components/casino/CameraController';

interface CameraControllerAPI {
  navigateToGame: (gameId: string) => gsap.core.Timeline | null;
  navigateToPosition: (positionKey: keyof typeof CAMERA_POSITIONS) => gsap.core.Timeline | null;
  transitionToPosition: (targetState: CameraState, duration?: number, ease?: string) => gsap.core.Timeline | null;
  getCurrentPosition: () => CameraState | null;
  isTransitioning: () => boolean;
}

export function useCameraController(): CameraControllerAPI {
  const currentTransition = useRef<gsap.core.Timeline | null>(null);

  const navigateToGame = useCallback((gameId: string): gsap.core.Timeline | null => {
    const controller = (window as any).cameraController;
    if (controller && controller.navigateToGame) {
      const timeline = controller.navigateToGame(gameId);
      currentTransition.current = timeline;
      return timeline;
    }
    return null;
  }, []);

  const navigateToPosition = useCallback((positionKey: keyof typeof CAMERA_POSITIONS): gsap.core.Timeline | null => {
    const controller = (window as any).cameraController;
    if (controller && controller.navigateToPosition) {
      const timeline = controller.navigateToPosition(positionKey);
      currentTransition.current = timeline;
      return timeline;
    }
    return null;
  }, []);

  const transitionToPosition = useCallback((
    targetState: CameraState,
    duration: number = 2,
    ease: string = 'power2.inOut'
  ): gsap.core.Timeline | null => {
    const controller = (window as any).cameraController;
    if (controller && controller.transitionToPosition) {
      const timeline = controller.transitionToPosition(targetState, duration, ease);
      currentTransition.current = timeline;
      return timeline;
    }
    return null;
  }, []);

  const getCurrentPosition = useCallback((): CameraState | null => {
    const controller = (window as any).cameraController;
    if (controller && controller.getCurrentPosition) {
      return controller.getCurrentPosition();
    }
    return null;
  }, []);

  const isTransitioning = useCallback((): boolean => {
    return currentTransition.current ? currentTransition.current.isActive() : false;
  }, []);

  return {
    navigateToGame,
    navigateToPosition,
    transitionToPosition,
    getCurrentPosition,
    isTransitioning
  };
}

// Predefined camera positions for easy access
export { CAMERA_POSITIONS } from '@/components/casino/CameraController';

// Helper function to create smooth camera transitions
export function createCameraTransition(
  from: CameraState,
  to: CameraState,
  duration: number = 2,
  ease: string = 'power2.inOut'
) {
  return {
    from,
    to,
    duration,
    ease
  };
}

// Helper function to interpolate between camera states
export function interpolateCameraState(
  from: CameraState,
  to: CameraState,
  progress: number
): CameraState {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  
  return {
    position: [
      lerp(from.position[0], to.position[0], progress),
      lerp(from.position[1], to.position[1], progress),
      lerp(from.position[2], to.position[2], progress)
    ],
    target: [
      lerp(from.target[0], to.target[0], progress),
      lerp(from.target[1], to.target[1], progress),
      lerp(from.target[2], to.target[2], progress)
    ],
    fov: from.fov && to.fov ? lerp(from.fov, to.fov, progress) : from.fov || to.fov
  };
}