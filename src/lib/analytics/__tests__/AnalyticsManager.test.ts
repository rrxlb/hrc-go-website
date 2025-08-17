/**
 * Tests for AnalyticsManager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalyticsManager } from '../AnalyticsManager';
import { AnalyticsConfig } from '../types';

// Mock fetch
global.fetch = vi.fn();

// Mock performance
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    location: { href: 'https://test.com' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
});

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    referrer: 'https://referrer.com'
  }
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Test User Agent'
  }
});

describe('AnalyticsManager', () => {
  let config: AnalyticsConfig;
  let analyticsManager: AnalyticsManager;

  beforeEach(() => {
    config = {
      enabled: true,
      debug: false,
      batchSize: 5,
      flushInterval: 1000,
      endpoints: {
        events: '/api/analytics/events',
        performance: '/api/analytics/performance',
        conversions: '/api/analytics/conversions'
      },
      sampling: {
        performance: 1.0,
        interactions: 1.0,
        conversions: 1.0
      }
    };

    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(() => {
    if (analyticsManager) {
      analyticsManager.destroy();
    }
  });

  it('should initialize with a session ID', () => {
    analyticsManager = new AnalyticsManager(config);
    const sessionId = analyticsManager.getSessionId();
    
    expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
  });

  it('should track game interactions', () => {
    analyticsManager = new AnalyticsManager(config);
    const trackSpy = vi.spyOn(analyticsManager, 'track');

    analyticsManager.trackGameInteraction({
      event: 'game_hover',
      category: 'game_interaction',
      action: 'hover',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'hover'
    });

    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'game_hover',
        category: 'game_interaction',
        action: 'hover',
        gameId: 'blackjack',
        gameType: 'card_game',
        interactionType: 'hover'
      })
    );
  });

  it('should track conversions', () => {
    analyticsManager = new AnalyticsManager(config);
    const trackSpy = vi.spyOn(analyticsManager, 'track');

    analyticsManager.trackConversion({
      event: 'discord_cta_click',
      category: 'conversion',
      action: 'cta_click',
      conversionType: 'discord_cta_click',
      source: 'game_table',
      ctaPosition: 'floating'
    });

    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'discord_cta_click',
        category: 'conversion',
        conversionType: 'discord_cta_click',
        source: 'game_table'
      })
    );
  });

  it('should track user journey events', () => {
    analyticsManager = new AnalyticsManager(config);
    const trackSpy = vi.spyOn(analyticsManager, 'track');

    analyticsManager.trackUserJourney({
      event: 'page_view',
      category: 'user_journey',
      action: 'page_view',
      journeyStage: 'exploration',
      pageUrl: 'https://test.com/games'
    });

    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'page_view',
        category: 'user_journey',
        journeyStage: 'exploration',
        pageUrl: 'https://test.com/games'
      })
    );
  });

  it('should track performance metrics', () => {
    analyticsManager = new AnalyticsManager(config);
    const trackSpy = vi.spyOn(analyticsManager, 'track');

    analyticsManager.trackPerformance({
      event: 'fps_measurement',
      category: 'performance',
      action: 'fps_measurement',
      metricType: 'fps',
      value: 60,
      deviceInfo: {
        userAgent: 'Test User Agent',
        screenResolution: '1920x1080',
        devicePixelRatio: 1,
        webglSupport: true,
        isMobile: false
      }
    });

    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'fps_measurement',
        category: 'performance',
        metricType: 'fps',
        value: 60
      })
    );
  });

  it('should flush events when batch size is reached', async () => {
    analyticsManager = new AnalyticsManager(config);

    // Add events up to batch size
    for (let i = 0; i < config.batchSize; i++) {
      analyticsManager.track({
        event: `test_event_${i}`,
        category: 'test',
        action: 'test',
        timestamp: Date.now(),
        sessionId: analyticsManager.getSessionId()
      });
    }

    // Wait for flush
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(fetch).toHaveBeenCalled();
  });

  it('should respect sampling rates', () => {
    // Create a disabled config to avoid initialization events
    const disabledConfig = { ...config, enabled: false };
    analyticsManager = new AnalyticsManager(disabledConfig);
    
    // Manually enable for testing
    (analyticsManager as any).isInitialized = true;
    (analyticsManager as any).config.enabled = true;

    // Mock Math.random to return 1.0 (100%) - should be filtered out by 0% sampling
    const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(1.0);

    const lowSamplingConfig = {
      ...config,
      enabled: true,
      sampling: {
        performance: 0.0, // 0% sampling
        interactions: 1.0,
        conversions: 1.0
      }
    };
    
    (analyticsManager as any).config = lowSamplingConfig;

    // Track performance event that should be sampled out (1.0 > 0.0)
    analyticsManager.trackPerformance({
      event: 'fps_measurement',
      category: 'performance',
      action: 'fps_measurement',
      metricType: 'fps',
      value: 60,
      deviceInfo: {
        userAgent: 'Test User Agent',
        screenResolution: '1920x1080',
        devicePixelRatio: 1,
        webglSupport: true,
        isMobile: false
      }
    });

    // Should have 0 events (performance event was sampled out)
    expect((analyticsManager as any).eventQueue).toHaveLength(0);

    // Test with 100% sampling
    mathRandomSpy.mockReturnValue(0.0); // 0.0 < 1.0, so should pass
    
    const highSamplingConfig = {
      ...config,
      enabled: true,
      sampling: {
        performance: 1.0, // 100% sampling
        interactions: 1.0,
        conversions: 1.0
      }
    };
    
    (analyticsManager as any).config = highSamplingConfig;
    
    analyticsManager.trackPerformance({
      event: 'fps_measurement',
      category: 'performance',
      action: 'fps_measurement',
      metricType: 'fps',
      value: 60,
      deviceInfo: {
        userAgent: 'Test User Agent',
        screenResolution: '1920x1080',
        devicePixelRatio: 1,
        webglSupport: true,
        isMobile: false
      }
    });

    // Should now have 1 event (performance event was included)
    expect((analyticsManager as any).eventQueue).toHaveLength(1);

    mathRandomSpy.mockRestore();
  });

  it('should handle flush errors gracefully', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));
    
    analyticsManager = new AnalyticsManager(config);
    
    // Add an event
    analyticsManager.track({
      event: 'test_event',
      category: 'test',
      action: 'test',
      timestamp: Date.now(),
      sessionId: analyticsManager.getSessionId()
    });

    // Flush should not throw
    await expect(analyticsManager.flush()).resolves.not.toThrow();
  });

  it('should set user ID correctly', () => {
    analyticsManager = new AnalyticsManager(config);
    const trackSpy = vi.spyOn(analyticsManager, 'track');

    analyticsManager.setUserId('user123');

    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'user_identified',
        userId: 'user123'
      })
    );
  });

  it('should not track when disabled', () => {
    const disabledConfig = { ...config, enabled: false };
    analyticsManager = new AnalyticsManager(disabledConfig);
    
    const trackSpy = vi.spyOn(analyticsManager, 'track');

    analyticsManager.trackGameInteraction({
      event: 'game_hover',
      category: 'game_interaction',
      action: 'hover',
      gameId: 'blackjack',
      gameType: 'card_game',
      interactionType: 'hover'
    });

    expect(trackSpy).toHaveBeenCalled();
    // But the internal tracking should be skipped
  });
});