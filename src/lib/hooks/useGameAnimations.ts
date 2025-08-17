'use client';

import { useState, useCallback, useRef } from 'react';

export interface GameAnimationState {
  isAnimating: boolean;
  animationType: string | null;
  progress: number;
}

export interface UseGameAnimationsReturn {
  animationState: GameAnimationState;
  startAnimation: (type: string) => void;
  stopAnimation: () => void;
  isAnimating: boolean;
}

export function useGameAnimations(): UseGameAnimationsReturn {
  const [animationState, setAnimationState] = useState<GameAnimationState>({
    isAnimating: false,
    animationType: null,
    progress: 0
  });
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = useCallback((type: string) => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setAnimationState({
      isAnimating: true,
      animationType: type,
      progress: 0
    });

    // Auto-stop animation after a reasonable time (fallback)
    animationTimeoutRef.current = setTimeout(() => {
      stopAnimation();
    }, 10000); // 10 seconds max
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    setAnimationState({
      isAnimating: false,
      animationType: null,
      progress: 0
    });
  }, []);

  return {
    animationState,
    startAnimation,
    stopAnimation,
    isAnimating: animationState.isAnimating
  };
}

// Game-specific animation types
export const ANIMATION_TYPES = {
  BLACKJACK_DEAL: 'blackjack_deal',
  ROULETTE_SPIN: 'roulette_spin',
  SLOT_SPIN: 'slot_spin',
  CRAPS_ROLL: 'craps_roll'
} as const;

export type AnimationType = typeof ANIMATION_TYPES[keyof typeof ANIMATION_TYPES];