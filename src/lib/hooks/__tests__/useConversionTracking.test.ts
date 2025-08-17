/**
 * Tests for useConversionTracking hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConversionTracking } from '../useConversionTracking';
import { afterEach } from 'node:test';

// Mock the analytics context
const mockAnalytics = {
  trackConversion: vi.fn(),
  track: vi.fn(),
  trackGameInteraction: vi.fn(),
  trackUserJourney: vi.fn(),
  trackPerformance: vi.fn(),
  flush: vi.fn(),
  setUserId: vi.fn(),
  getSessionId: vi.fn(() => 'test-session')
};

vi.mock('../../analytics/AnalyticsContext', () => ({
  useAnalytics: () => mockAnalytics
}));

describe('useConversionTracking', () => {
  const options = {
    source: 'game_table',
    gameContext: 'blackjack'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track Discord CTA clicks', () => {
    const { result } = renderHook(() => useConversionTracking(options));

    act(() => {
      result.current.trackDiscordCTAClick('floating', { variant: 'primary' });
    });

    expect(mockAnalytics.trackConversion).toHaveBeenCalledWith({
      event: 'discord_cta_click',
      category: 'conversion',
      action: 'cta_click',
      conversionType: 'discord_cta_click',
      source: 'game_table',
      gameContext: 'blackjack',
      ctaPosition: 'floating',
      label: 'discord_cta_floating',
      metadata: expect.objectContaining({
        variant: 'primary',
        clickTimestamp: expect.any(Number)
      })
    });
  });

  it('should track game try clicks', () => {
    const { result } = renderHook(() => useConversionTracking(options));

    act(() => {
      result.current.trackGameTryClick('roulette', 'info_panel');
    });

    expect(mockAnalytics.trackConversion).toHaveBeenCalledWith({
      event: 'game_try_click',
      category: 'conversion',
      action: 'game_try',
      conversionType: 'game_try_click',
      source: 'roulette',
      gameContext: 'roulette',
      ctaPosition: 'info_panel',
      label: 'game_try_roulette',
      metadata: {
        gameId: 'roulette',
        fromGameContext: 'blackjack',
        originalSource: 'game_table'
      }
    });
  });

  it('should track navigation clicks', () => {
    const { result } = renderHook(() => useConversionTracking(options));

    act(() => {
      result.current.trackNavigationClick('games_page', 'main_nav');
    });

    expect(mockAnalytics.trackConversion).toHaveBeenCalledWith({
      event: 'navigation_click',
      category: 'conversion',
      action: 'navigation',
      conversionType: 'navigation_click',
      source: 'main_nav',
      gameContext: 'blackjack',
      ctaPosition: 'main_nav',
      label: 'navigation_games_page',
      metadata: {
        destination: 'games_page',
        navigationSource: 'main_nav'
      }
    });
  });

  it('should track conversion funnel steps', () => {
    const { result } = renderHook(() => useConversionTracking(options));

    act(() => {
      result.current.trackConversionFunnel('consideration', { step: 'game_info_viewed' });
    });

    expect(mockAnalytics.trackConversion).toHaveBeenCalledWith({
      event: 'conversion_funnel',
      category: 'conversion',
      action: 'funnel_step',
      conversionType: 'navigation_click',
      source: 'game_table',
      gameContext: 'blackjack',
      ctaPosition: 'consideration',
      label: 'funnel_consideration',
      metadata: {
        funnelStep: 'consideration',
        step: 'game_info_viewed'
      }
    });
  });

  it('should track external link clicks', () => {
    const { result } = renderHook(() => useConversionTracking(options));

    act(() => {
      result.current.trackExternalLinkClick('https://discord.gg/test', 'footer_link');
    });

    expect(mockAnalytics.trackConversion).toHaveBeenCalledWith({
      event: 'external_link_click',
      category: 'conversion',
      action: 'external_link',
      conversionType: 'navigation_click',
      source: 'footer_link',
      gameContext: 'blackjack',
      ctaPosition: 'footer_link',
      label: 'external_link_footer_link',
      metadata: {
        url: 'https://discord.gg/test',
        linkContext: 'footer_link',
        isDiscordLink: true
      }
    });
  });

  it('should track conversion completion with duration', () => {
    const { result } = renderHook(() => useConversionTracking(options));

    // Start a CTA interaction
    act(() => {
      result.current.trackDiscordCTAClick('floating');
    });

    // Advance time and complete conversion
    act(() => {
      vi.advanceTimersByTime(2000);
      result.current.trackConversionComplete('discord_join', 100);
    });

    expect(mockAnalytics.trackConversion).toHaveBeenCalledWith({
      event: 'conversion_complete',
      category: 'conversion',
      action: 'complete',
      conversionType: 'discord_cta_click',
      source: 'game_table',
      gameContext: 'blackjack',
      ctaPosition: 'discord_join',
      label: 'conversion_complete_discord_join',
      value: 100,
      metadata: {
        conversionType: 'discord_join',
        interactionDuration: 2000
      }
    });
  });

  it('should work with default options', () => {
    const { result } = renderHook(() => useConversionTracking());

    act(() => {
      result.current.trackDiscordCTAClick('header');
    });

    expect(mockAnalytics.trackConversion).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'unknown',
        gameContext: undefined
      })
    );
  });
});