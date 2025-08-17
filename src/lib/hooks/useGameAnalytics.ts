/**
 * Hook for tracking game-specific interactions and analytics
 */

'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useAnalytics } from '../analytics/AnalyticsContext';

interface GameAnalyticsOptions {
  gameId: string;
  gameType: string;
}

export function useGameAnalytics({ gameId, gameType }: GameAnalyticsOptions) {
  const analytics = useAnalytics();
  const interactionStartTime = useRef<number | null>(null);
  const viewStartTime = useRef<number | null>(null);

  const trackGameHover = useCallback((cameraPosition?: [number, number, number]) => {
    analytics.trackGameInteraction({
      event: 'game_hover',
      category: 'game_interaction',
      action: 'hover',
      gameId,
      gameType,
      interactionType: 'hover',
      cameraPosition,
      label: `${gameType}_hover`
    });
  }, [analytics, gameId, gameType]);

  const trackGameClick = useCallback((cameraPosition?: [number, number, number]) => {
    analytics.trackGameInteraction({
      event: 'game_click',
      category: 'game_interaction',
      action: 'click',
      gameId,
      gameType,
      interactionType: 'click',
      cameraPosition,
      label: `${gameType}_click`
    });
  }, [analytics, gameId, gameType]);

  const trackGameView = useCallback((cameraPosition?: [number, number, number]) => {
    viewStartTime.current = Date.now();
    analytics.trackGameInteraction({
      event: 'game_view',
      category: 'game_interaction',
      action: 'view',
      gameId,
      gameType,
      interactionType: 'view',
      cameraPosition,
      label: `${gameType}_view`
    });
  }, [analytics, gameId, gameType]);

  const trackGameViewEnd = useCallback(() => {
    if (viewStartTime.current) {
      const duration = Date.now() - viewStartTime.current;
      analytics.trackGameInteraction({
        event: 'game_view_end',
        category: 'game_interaction',
        action: 'view_end',
        gameId,
        gameType,
        interactionType: 'view',
        duration,
        label: `${gameType}_view_duration`,
        value: duration
      });
      viewStartTime.current = null;
    }
  }, [analytics, gameId, gameType]);

  const trackDemoStart = useCallback(() => {
    interactionStartTime.current = Date.now();
    analytics.trackGameInteraction({
      event: 'demo_start',
      category: 'game_interaction',
      action: 'demo_start',
      gameId,
      gameType,
      interactionType: 'demo_start',
      label: `${gameType}_demo_start`
    });
  }, [analytics, gameId, gameType]);

  const trackDemoComplete = useCallback(() => {
    const duration = interactionStartTime.current 
      ? Date.now() - interactionStartTime.current 
      : undefined;
    
    analytics.trackGameInteraction({
      event: 'demo_complete',
      category: 'game_interaction',
      action: 'demo_complete',
      gameId,
      gameType,
      interactionType: 'demo_complete',
      duration,
      label: `${gameType}_demo_complete`,
      value: duration
    });
    
    interactionStartTime.current = null;
  }, [analytics, gameId, gameType]);

  const trackGameEngagement = useCallback((engagementType: string, value?: number) => {
    analytics.trackGameInteraction({
      event: 'game_engagement',
      category: 'game_interaction',
      action: 'engagement',
      gameId,
      gameType,
      interactionType: 'view',
      label: `${gameType}_${engagementType}`,
      value,
      metadata: {
        engagementType
      }
    });
  }, [analytics, gameId, gameType]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (viewStartTime.current) {
        trackGameViewEnd();
      }
    };
  }, [trackGameViewEnd]);

  return {
    trackGameHover,
    trackGameClick,
    trackGameView,
    trackGameViewEnd,
    trackDemoStart,
    trackDemoComplete,
    trackGameEngagement
  };
}