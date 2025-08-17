'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, MathUtils } from 'three';
import { gsap } from 'gsap';
import { CameraState } from '@/lib/types';
import { GAMES } from '@/lib/data/games';

interface CameraControllerProps {
  enabled?: boolean;
  sensitivity?: number;
  smoothness?: number;
  onCameraChange?: (position: Vector3, target: Vector3) => void;
}

// Predefined camera positions for different casino areas
export const CAMERA_POSITIONS: Record<string, CameraState> = {
  default: {
    position: [0, 1.6, 3] as [number, number, number],
    target: [0, 1, 0] as [number, number, number],
    fov: 75
  },
  overview: {
    position: [0, 4, 8] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
    fov: 60
  },
  // Game-specific positions based on games data
  ...GAMES.reduce((acc, game) => {
    acc[game.id] = {
      position: game.showcase.cameraPosition,
      target: [game.showcase.cameraPosition[0], 1, game.showcase.cameraPosition[2] - 1] as [number, number, number],
      fov: 75
    };
    return acc;
  }, {} as Record<string, CameraState>)
};

export default function CameraController({
  enabled = true,
  sensitivity = 0.002,
  smoothness = 0.1,
  onCameraChange
}: CameraControllerProps) {
  const { camera, gl } = useThree();
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(new Vector3(0, 1, 0));
  
  // Mouse movement tracking
  const mouseMovement = useRef({ x: 0, y: 0 });
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));
  const velocity = useRef(new Vector3());
  
  // Touch tracking for mobile
  const lastTouchPosition = useRef({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);

  // Camera constraints for first-person table perspective
  const CONSTRAINTS = useMemo(() => ({
    minPolarAngle: Math.PI / 6, // 30 degrees - can't look too far up
    maxPolarAngle: Math.PI / 2.2, // ~80 degrees - can't look too far down
    minDistance: 1.5, // Minimum distance from target
    maxDistance: 8, // Maximum distance from target
    heightMin: 1.2, // Minimum camera height (sitting position)
    heightMax: 2.5, // Maximum camera height (standing position)
    boundaryRadius: 9 // Stay within casino bounds
  }), []);

  // Smooth camera transition using GSAP
  const transitionToPosition = useCallback((
    targetState: CameraState,
    duration: number = 2,
    ease: string = 'power2.inOut'
  ) => {
    const currentPosition = camera.position.clone();
    const lookTarget = currentTarget.clone();
    
    // Create GSAP timeline for smooth transition
    const tl = gsap.timeline();
    
    // Animate camera position
    tl.to(currentPosition, {
      x: targetState.position[0],
      y: targetState.position[1],
      z: targetState.position[2],
      duration,
      ease,
      onUpdate: () => {
        camera.position.copy(currentPosition);
      }
    });

    // Animate camera target (where it's looking)
    tl.to(lookTarget, {
      x: targetState.target[0],
      y: targetState.target[1],
      z: targetState.target[2],
      duration,
      ease,
      onUpdate: () => {
        setCurrentTarget(lookTarget.clone());
        camera.lookAt(lookTarget);
        
        // Update mouse movement to match new orientation
        const direction = lookTarget.clone().sub(camera.position).normalize();
        mouseMovement.current.x = Math.atan2(direction.x, direction.z);
        mouseMovement.current.y = Math.asin(-direction.y);
      }
    }, 0); // Start at the same time as position animation

    // Animate FOV if specified
    if (targetState.fov && camera.type === 'PerspectiveCamera') {
      tl.to(camera, {
        fov: targetState.fov,
        duration,
        ease,
        onUpdate: () => {
          camera.updateProjectionMatrix();
        }
      }, 0);
    }

    return tl;
  }, [camera, currentTarget]);

  // Navigate to specific game area
  const navigateToGame = useCallback((gameId: string) => {
    const position = CAMERA_POSITIONS[gameId];
    if (position) {
      transitionToPosition(position);
    }
  }, [transitionToPosition]);

  // Navigate to predefined position
  const navigateToPosition = useCallback((positionKey: keyof typeof CAMERA_POSITIONS) => {
    const position = CAMERA_POSITIONS[positionKey];
    if (position) {
      transitionToPosition(position);
    }
  }, [transitionToPosition]);

  // Mouse event handlers
  const handlePointerLockChange = useCallback(() => {
    setIsPointerLocked(document.pointerLockElement === gl.domElement);
  }, [gl.domElement]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isPointerLocked || !enabled) return;

    mouseMovement.current.x -= event.movementX * sensitivity;
    mouseMovement.current.y -= event.movementY * sensitivity;

    // Apply constraints to vertical rotation
    mouseMovement.current.y = MathUtils.clamp(
      mouseMovement.current.y,
      -CONSTRAINTS.maxPolarAngle + Math.PI / 2,
      -CONSTRAINTS.minPolarAngle + Math.PI / 2
    );
  }, [isPointerLocked, enabled, sensitivity]);

  const handleClick = useCallback(() => {
    if (enabled) {
      gl.domElement.requestPointerLock();
    }
  }, [enabled, gl.domElement]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    lastTouchPosition.current = { x: touch.clientX, y: touch.clientY };
    setIsTouching(true);
  }, [enabled]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled || !isTouching || event.touches.length !== 1) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    const deltaX = touch.clientX - lastTouchPosition.current.x;
    const deltaY = touch.clientY - lastTouchPosition.current.y;

    // Increase sensitivity for touch and add smoothing
    const touchSensitivity = sensitivity * 3;
    mouseMovement.current.x -= deltaX * touchSensitivity;
    mouseMovement.current.y -= deltaY * touchSensitivity;

    // Apply constraints
    mouseMovement.current.y = MathUtils.clamp(
      mouseMovement.current.y,
      -CONSTRAINTS.maxPolarAngle + Math.PI / 2,
      -CONSTRAINTS.minPolarAngle + Math.PI / 2
    );

    lastTouchPosition.current = { x: touch.clientX, y: touch.clientY };
  }, [enabled, isTouching, sensitivity]);

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    canvas.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    
    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    gl.domElement,
    handlePointerLockChange,
    handleClick,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  ]);

  // Apply camera movement constraints
  const applyConstraints = useCallback((position: Vector3) => {
    // Keep camera within height bounds
    position.y = MathUtils.clamp(position.y, CONSTRAINTS.heightMin, CONSTRAINTS.heightMax);
    
    // Keep camera within casino boundary (circular boundary)
    const distanceFromCenter = Math.sqrt(position.x * position.x + position.z * position.z);
    if (distanceFromCenter > CONSTRAINTS.boundaryRadius) {
      const scale = CONSTRAINTS.boundaryRadius / distanceFromCenter;
      position.x *= scale;
      position.z *= scale;
    }
    
    return position;
  }, []);

  // Update camera each frame
  useFrame((state, delta) => {
    if (!enabled) return;

    // Apply smooth mouse/touch rotation
    euler.current.setFromQuaternion(camera.quaternion);
    euler.current.y = mouseMovement.current.x;
    euler.current.x = mouseMovement.current.y;
    camera.quaternion.setFromEuler(euler.current);

    // Apply constraints to camera position
    const constrainedPosition = applyConstraints(camera.position);
    camera.position.copy(constrainedPosition);

    // Smooth camera movement
    velocity.current.multiplyScalar(1 - smoothness);
    camera.position.add(velocity.current);

    // Update target for looking
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    const newTarget = camera.position.clone().add(direction.multiplyScalar(5));
    setCurrentTarget(newTarget);

    // Notify parent component of camera changes
    if (onCameraChange) {
      onCameraChange(camera.position, currentTarget);
    }
  });

  // Expose navigation methods through ref or context
  useEffect(() => {
    // Store navigation methods on window for external access (temporary solution)
    (window as any).cameraController = {
      navigateToGame,
      navigateToPosition,
      transitionToPosition,
      CAMERA_POSITIONS
    };

    return () => {
      delete (window as any).cameraController;
    };
  }, [navigateToGame, navigateToPosition, transitionToPosition]);

  return null; // This component doesn't render anything visible
}

// Export types for external use
export type { CameraControllerProps };