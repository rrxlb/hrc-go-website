import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameInfoPanel } from '../useGameInfoPanel';
import { GameConfig } from '@/lib/types';

const mockGame1: GameConfig = {
  id: 'blackjack',
  name: 'blackjack',
  displayName: 'Blackjack',
  description: 'Classic 21 card game',
  features: [],
  showcase: {
    tableModel: '/models/blackjack-table.glb',
    cameraPosition: [0, 1.5, 2],
    animations: [],
    interactiveElements: []
  },
  discordCommand: '/blackjack'
};

const mockGame2: GameConfig = {
  id: 'roulette',
  name: 'roulette',
  displayName: 'Roulette',
  description: 'European roulette game',
  features: [],
  showcase: {
    tableModel: '/models/roulette-table.glb',
    cameraPosition: [0, 2, 3],
    animations: [],
    interactiveElements: []
  },
  discordCommand: '/roulette'
};

describe('useGameInfoPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useGameInfoPanel());

    expect(result.current.selectedGame).toBeNull();
    expect(result.current.isVisible).toBe(false);
  });

  it('shows game info correctly', () => {
    const { result } = renderHook(() => useGameInfoPanel());

    act(() => {
      result.current.showGameInfo(mockGame1);
    });

    expect(result.current.selectedGame).toBe(mockGame1);
    expect(result.current.isVisible).toBe(true);
  });

  it('hides game info correctly', () => {
    const { result } = renderHook(() => useGameInfoPanel());

    // First show a game
    act(() => {
      result.current.showGameInfo(mockGame1);
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.selectedGame).toBe(mockGame1);

    // Then hide it
    act(() => {
      result.current.hideGameInfo();
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.selectedGame).toBe(mockGame1); // Still there initially

    // After timeout, selectedGame should be null
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.selectedGame).toBeNull();
  });

  it('toggles game info when called with same game', () => {
    const { result } = renderHook(() => useGameInfoPanel());

    // First toggle should show the game
    act(() => {
      result.current.toggleGameInfo(mockGame1);
    });

    expect(result.current.selectedGame).toBe(mockGame1);
    expect(result.current.isVisible).toBe(true);

    // Second toggle with same game should hide it
    act(() => {
      result.current.toggleGameInfo(mockGame1);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('switches to different game when toggling with different game', () => {
    const { result } = renderHook(() => useGameInfoPanel());

    // Show first game
    act(() => {
      result.current.toggleGameInfo(mockGame1);
    });

    expect(result.current.selectedGame).toBe(mockGame1);
    expect(result.current.isVisible).toBe(true);

    // Toggle with different game should switch to it
    act(() => {
      result.current.toggleGameInfo(mockGame2);
    });

    expect(result.current.selectedGame).toBe(mockGame2);
    expect(result.current.isVisible).toBe(true);
  });

  it('hides panel when toggling without game parameter while visible', () => {
    const { result } = renderHook(() => useGameInfoPanel());

    // Show a game first
    act(() => {
      result.current.showGameInfo(mockGame1);
    });

    expect(result.current.isVisible).toBe(true);

    // Toggle without parameter should hide
    act(() => {
      result.current.toggleGameInfo();
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('does nothing when toggling without game parameter while hidden', () => {
    const { result } = renderHook(() => useGameInfoPanel());

    expect(result.current.isVisible).toBe(false);

    // Toggle without parameter when already hidden should do nothing
    act(() => {
      result.current.toggleGameInfo();
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.selectedGame).toBeNull();
  });

  it('maintains stable function references', () => {
    const { result, rerender } = renderHook(() => useGameInfoPanel());

    const initialFunctions = {
      showGameInfo: result.current.showGameInfo,
      hideGameInfo: result.current.hideGameInfo,
      toggleGameInfo: result.current.toggleGameInfo,
    };

    // Trigger a re-render
    rerender();

    expect(result.current.showGameInfo).toBe(initialFunctions.showGameInfo);
    expect(result.current.hideGameInfo).toBe(initialFunctions.hideGameInfo);
    expect(result.current.toggleGameInfo).toBe(initialFunctions.toggleGameInfo);
  });

  it('handles rapid show/hide operations correctly', () => {
    const { result } = renderHook(() => useGameInfoPanel());

    // Rapid show/hide operations
    act(() => {
      result.current.showGameInfo(mockGame1);
      result.current.hideGameInfo();
      result.current.showGameInfo(mockGame2);
    });

    expect(result.current.selectedGame).toBe(mockGame2);
    expect(result.current.isVisible).toBe(true);

    // The timeout from hideGameInfo should not affect the new game
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should still show mockGame2 since it was the last one shown and is visible
    expect(result.current.selectedGame).toBe(mockGame2);
    expect(result.current.isVisible).toBe(true);
  });
});