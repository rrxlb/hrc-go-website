'use client';

import { useState, useCallback, useRef } from 'react';
import { GameConfig } from '@/lib/types';

interface UseGameInfoPanelReturn {
  selectedGame: GameConfig | null;
  isVisible: boolean;
  showGameInfo: (game: GameConfig) => void;
  hideGameInfo: () => void;
  toggleGameInfo: (game?: GameConfig) => void;
}

export function useGameInfoPanel(): UseGameInfoPanelReturn {
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showGameInfo = useCallback((game: GameConfig) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSelectedGame(game);
    setIsVisible(true);
  }, []);

  const hideGameInfo = useCallback(() => {
    setIsVisible(false);
    // Keep the selected game for a moment to allow exit animation
    timeoutRef.current = setTimeout(() => {
      setSelectedGame(null);
      timeoutRef.current = null;
    }, 300);
  }, []);

  const toggleGameInfo = useCallback((game?: GameConfig) => {
    if (isVisible && (!game || game.id === selectedGame?.id)) {
      hideGameInfo();
    } else if (game) {
      showGameInfo(game);
    }
  }, [isVisible, selectedGame, showGameInfo, hideGameInfo]);

  return {
    selectedGame,
    isVisible,
    showGameInfo,
    hideGameInfo,
    toggleGameInfo,
  };
}