/**
 * Hook for tracking conversion events and Discord CTA interactions
 */

'use client';

import { useCallback, useRef } from 'react';
import { useAnalytics } from '../analytics/AnalyticsContext';

interface ConversionTrackingOptions {
  source?: string;
  gameContext?: string;
}

export function useConversionTracking(options: ConversionTrackingOptions = {}) {
  const analytics = useAnalytics();
  const ctaInteractionTime = useRef<number | null>(null);

  const trackDiscordCTAClick = useCallback((ctaPosition: string, additionalData?: Record<string, any>) => {
    ctaInteractionTime.current = Date.now();
    
    analytics.trackConversion({
      event: 'discord_cta_click',
      category: 'conversion',
      action: 'cta_click',
      conversionType: 'discord_cta_click',
      source: options.source || 'unknown',
      gameContext: options.gameContext,
      ctaPosition,
      label: `discord_cta_${ctaPosition}`,
      metadata: {
        ...additionalData,
        clickTimestamp: Date.now(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
      }
    });
  }, [analytics, options.source, options.gameContext]);

  const trackGameTryClick = useCallback((gameId: string, ctaPosition: string) => {
    analytics.trackConversion({
      event: 'game_try_click',
      category: 'conversion',
      action: 'game_try',
      conversionType: 'game_try_click',
      source: gameId, // Use gameId as source for game try clicks
      gameContext: gameId,
      ctaPosition,
      label: `game_try_${gameId}`,
      metadata: {
        gameId,
        fromGameContext: options.gameContext,
        originalSource: options.source
      }
    });
  }, [analytics, options.source, options.gameContext]);

  const trackNavigationClick = useCallback((destination: string, navigationSource: string) => {
    analytics.trackConversion({
      event: 'navigation_click',
      category: 'conversion',
      action: 'navigation',
      conversionType: 'navigation_click',
      source: navigationSource,
      gameContext: options.gameContext,
      ctaPosition: navigationSource,
      label: `navigation_${destination}`,
      metadata: {
        destination,
        navigationSource
      }
    });
  }, [analytics, options.gameContext]);

  const trackConversionFunnel = useCallback((
    funnelStep: 'awareness' | 'interest' | 'consideration' | 'intent' | 'conversion',
    stepData?: Record<string, any>
  ) => {
    analytics.trackConversion({
      event: 'conversion_funnel',
      category: 'conversion',
      action: 'funnel_step',
      conversionType: 'navigation_click',
      source: options.source || 'funnel',
      gameContext: options.gameContext,
      ctaPosition: funnelStep,
      label: `funnel_${funnelStep}`,
      metadata: {
        funnelStep,
        ...stepData
      }
    });
  }, [analytics, options.source, options.gameContext]);

  const trackExternalLinkClick = useCallback((url: string, linkContext: string) => {
    analytics.trackConversion({
      event: 'external_link_click',
      category: 'conversion',
      action: 'external_link',
      conversionType: 'navigation_click',
      source: linkContext,
      gameContext: options.gameContext,
      ctaPosition: linkContext,
      label: `external_link_${linkContext}`,
      metadata: {
        url,
        linkContext,
        isDiscordLink: url.includes('discord')
      }
    });
  }, [analytics, options.gameContext]);

  const trackConversionComplete = useCallback((conversionType: string, value?: number) => {
    const interactionDuration = ctaInteractionTime.current 
      ? Date.now() - ctaInteractionTime.current 
      : undefined;

    analytics.trackConversion({
      event: 'conversion_complete',
      category: 'conversion',
      action: 'complete',
      conversionType: 'discord_cta_click',
      source: options.source || 'unknown',
      gameContext: options.gameContext,
      ctaPosition: conversionType,
      label: `conversion_complete_${conversionType}`,
      value: value || interactionDuration,
      metadata: {
        conversionType,
        interactionDuration
      }
    });

    ctaInteractionTime.current = null;
  }, [analytics, options.source, options.gameContext]);

  return {
    trackDiscordCTAClick,
    trackGameTryClick,
    trackNavigationClick,
    trackConversionFunnel,
    trackExternalLinkClick,
    trackConversionComplete
  };
}