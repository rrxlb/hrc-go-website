'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AnimationState {
  [gameId: string]: {
    isActive: boolean;
    type: string;
    startTime: number;
  };
}

interface AnimationContextType {
  animationState: AnimationState;
  startAnimation: (gameId: string, type: string) => void;
  stopAnimation: (gameId: string) => void;
  isAnimating: (gameId: string) => boolean;
  getAnimationType: (gameId: string) => string | null;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [animationState, setAnimationState] = useState<AnimationState>({});

  const startAnimation = useCallback((gameId: string, type: string) => {
    setAnimationState(prev => ({
      ...prev,
      [gameId]: {
        isActive: true,
        type,
        startTime: Date.now()
      }
    }));
  }, []);

  const stopAnimation = useCallback((gameId: string) => {
    setAnimationState(prev => {
      const newState = { ...prev };
      if (newState[gameId]) {
        newState[gameId] = {
          ...newState[gameId],
          isActive: false
        };
      }
      return newState;
    });
  }, []);

  const isAnimating = useCallback((gameId: string) => {
    return animationState[gameId]?.isActive || false;
  }, [animationState]);

  const getAnimationType = useCallback((gameId: string) => {
    return animationState[gameId]?.type || null;
  }, [animationState]);

  return (
    <AnimationContext.Provider value={{
      animationState,
      startAnimation,
      stopAnimation,
      isAnimating,
      getAnimationType
    }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationManager() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationManager must be used within an AnimationProvider');
  }
  return context;
}

// Animation trigger component for easy integration
interface AnimationTriggerProps {
  gameId: string;
  animationType: string;
  children: (props: {
    isAnimating: boolean;
    startAnimation: () => void;
    stopAnimation: () => void;
  }) => ReactNode;
}

export function AnimationTrigger({ gameId, animationType, children }: AnimationTriggerProps) {
  const { isAnimating, startAnimation, stopAnimation } = useAnimationManager();
  
  const handleStart = useCallback(() => {
    startAnimation(gameId, animationType);
  }, [gameId, animationType, startAnimation]);

  const handleStop = useCallback(() => {
    stopAnimation(gameId);
  }, [gameId, stopAnimation]);

  return (
    <>
      {children({
        isAnimating: isAnimating(gameId),
        startAnimation: handleStart,
        stopAnimation: handleStop
      })}
    </>
  );
}