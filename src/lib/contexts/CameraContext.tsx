'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Vector3 } from 'three';
import { CameraState } from '@/lib/types';

interface CameraContextType {
  currentPosition: Vector3 | null;
  currentTarget: Vector3 | null;
  currentView: string;
  isTransitioning: boolean;
  setCurrentPosition: (position: Vector3) => void;
  setCurrentTarget: (target: Vector3) => void;
  setCurrentView: (view: string) => void;
  setIsTransitioning: (transitioning: boolean) => void;
  navigateToGame: (gameId: string) => void;
  navigateToPosition: (positionKey: string) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

interface CameraProviderProps {
  children: ReactNode;
}

export function CameraProvider({ children }: CameraProviderProps) {
  const [currentPosition, setCurrentPosition] = useState<Vector3 | null>(null);
  const [currentTarget, setCurrentTarget] = useState<Vector3 | null>(null);
  const [currentView, setCurrentView] = useState<string>('default');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const navigateToGame = useCallback((gameId: string) => {
    const controller = (window as any).cameraController;
    if (controller && controller.navigateToGame) {
      setIsTransitioning(true);
      const timeline = controller.navigateToGame(gameId);
      if (timeline) {
        timeline.eventCallback('onComplete', () => {
          setCurrentView(gameId);
          setIsTransitioning(false);
        });
      }
    }
  }, []);

  const navigateToPosition = useCallback((positionKey: string) => {
    const controller = (window as any).cameraController;
    if (controller && controller.navigateToPosition) {
      setIsTransitioning(true);
      const timeline = controller.navigateToPosition(positionKey);
      if (timeline) {
        timeline.eventCallback('onComplete', () => {
          setCurrentView(positionKey);
          setIsTransitioning(false);
        });
      }
    }
  }, []);

  const value: CameraContextType = {
    currentPosition,
    currentTarget,
    currentView,
    isTransitioning,
    setCurrentPosition,
    setCurrentTarget,
    setCurrentView,
    setIsTransitioning,
    navigateToGame,
    navigateToPosition
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraContext() {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCameraContext must be used within a CameraProvider');
  }
  return context;
}

// Helper hook for camera position tracking
export function useCameraPosition() {
  const { currentPosition, currentTarget, setCurrentPosition, setCurrentTarget } = useCameraContext();
  
  const updateCameraPosition = useCallback((position: Vector3, target: Vector3) => {
    setCurrentPosition(position.clone());
    setCurrentTarget(target.clone());
  }, [setCurrentPosition, setCurrentTarget]);

  return {
    position: currentPosition,
    target: currentTarget,
    updateCameraPosition
  };
}

// Helper hook for camera navigation
export function useCameraNavigation() {
  const { 
    currentView, 
    isTransitioning, 
    navigateToGame, 
    navigateToPosition 
  } = useCameraContext();

  return {
    currentView,
    isTransitioning,
    navigateToGame,
    navigateToPosition
  };
}