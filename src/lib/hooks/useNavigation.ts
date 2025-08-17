'use client';

import { useState, useCallback } from 'react';
import { GameConfig } from '@/lib/types';
import { GAMES, getGameById } from '@/lib/data/games';

export interface NavigationState {
  selectedGame: GameConfig | null;
  isMenuOpen: boolean;
  showGameInfo: boolean;
}

export function useNavigation() {
  const [state, setState] = useState<NavigationState>({
    selectedGame: null,
    isMenuOpen: false,
    showGameInfo: false,
  });

  const selectGame = useCallback((gameId: string) => {
    const game = getGameById(gameId);
    if (game) {
      setState(prev => ({
        ...prev,
        selectedGame: game,
        showGameInfo: true,
      }));
    }
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedGame: null,
      showGameInfo: false,
    }));
  }, []);

  const toggleMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMenuOpen: !prev.isMenuOpen,
    }));
  }, []);

  const closeMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMenuOpen: false,
    }));
  }, []);

  const openMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMenuOpen: true,
    }));
  }, []);

  const toggleGameInfo = useCallback(() => {
    setState(prev => ({
      ...prev,
      showGameInfo: !prev.showGameInfo,
    }));
  }, []);

  return {
    ...state,
    selectGame,
    clearSelection,
    toggleMenu,
    closeMenu,
    openMenu,
    toggleGameInfo,
    games: GAMES,
  };
}