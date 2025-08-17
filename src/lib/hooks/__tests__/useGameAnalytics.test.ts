/**
 * Tests for useGameAnalytics hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameAnalytics } from '../useGameAnalytics';

// Mock the analytics context
const mockAnalytics = {
  trackGameInteraction: vi.fn(),
  track: vi.fn(),
  trackConversion: vi.fn(),
  trackUserJourney: vi.fn(),
  trackPerformance: vi.fn(),
  flush: vi.fn(),
  setUserId: vi.fn(),
  getSessionId: vi.fn(() => 'test-session')
};

vi.mock('../../analytics/AnalyticsContext', () => ({
  useAnalytics: () => mockAnalytics
}));

describe('useGameAnalytics', () => {
  const gameOptions = {
    gameId: 'blackjack',
    gameType: 'card_game'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track game hover', () => {
    const { result } = renderHook(() => useGameAnalytics(gameOptions));

    act(() => {
      result.current.trackGameHover([1, 2, 3]);
    });

    expect(mockAnalytics.trackGameInteraction).toHaveBeenCalledWith({
      event: 'game_hover',
      category: 'game_interaction',
      action: 'hover',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'hover',
      cameraPosition: [1, 2, 3],
      label: 'card_game_hover'
    });
  });

  it('should track game click', () => {
    const { result } = renderHook(() => useGameAnalytics(gameOptions));

    act(() => {
      result.current.trackGameClick([4, 5, 6]);
    });

    expect(mockAnalytics.trackGameInteraction).toHaveBeenCalledWith({
      event: 'game_click',
      category: 'game_interaction',
      action: 'click',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'click',
      cameraPosition: [4, 5, 6],
      label: 'card_game_click'
    });
  });

  it('should track game view start and end', () => {
    const { result } = renderHook(() => useGameAnalytics(gameOptions));

    act(() => {
      result.current.trackGameView([7, 8, 9]);
    });

    expect(mockAnalytics.trackGameInteraction).toHaveBeenCalledWith({
      event: 'game_view',
      category: 'game_interaction',
      action: 'view',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'view',
      cameraPosition: [7, 8, 9],
      label: 'card_game_view'
    });

    // Advance time and end view
    act(() => {
      vi.advanceTimersByTime(5000);
      result.current.trackGameViewEnd();
    });

    expect(mockAnalytics.trackGameInteraction).toHaveBeenCalledWith({
      event: 'game_view_end',
      category: 'game_interaction',
      action: 'view_end',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'view',
      duration: 5000,
      label: 'card_game_view_duration',
      value: 5000
    });
  });

  it('should track demo start and complete', () => {
    const { result } = renderHook(() => useGameAnalytics(gameOptions));

    act(() => {
      result.current.trackDemoStart();
    });

    expect(mockAnalytics.trackGameInteraction).toHaveBeenCalledWith({
      event: 'demo_start',
      category: 'game_interaction',
      action: 'demo_start',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'demo_start',
      label: 'card_game_demo_start'
    });

    // Advance time and complete demo
    act(() => {
      vi.advanceTimersByTime(3000);
      result.current.trackDemoComplete();
    });

    expect(mockAnalytics.trackGameInteraction).toHaveBeenCalledWith({
      event: 'demo_complete',
      category: 'game_interaction',
      action: 'demo_complete',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'demo_complete',
      duration: 3000,
      label: 'card_game_demo_complete',
      value: 3000
    });
  });

  it('should track game engagement', () => {
    const { result } = renderHook(() => useGameAnalytics(gameOptions));

    act(() => {
      result.current.trackGameEngagement('interaction', 100);
    });

    expect(mockAnalytics.trackGameInteraction).toHaveBeenCalledWith({
      event: 'game_engagement',
      category: 'game_interaction',
      action: 'engagement',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'view',
      label: 'card_game_interaction',
      value: 100,
      metadata: {
        engagementType: 'interaction'
      }
    });
  });

  it('should clean up view tracking on unmount', () => {
    const { result, unmount } = renderHook(() => useGameAnalytics(gameOptions));

    act(() => {
      result.current.trackGameView();
    });

    // Unmount should trigger view end
    unmount();

    expect(mockAnalytics.trackGameInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'game_view_end',
        action: 'view_end'
      })
    );
  });
});