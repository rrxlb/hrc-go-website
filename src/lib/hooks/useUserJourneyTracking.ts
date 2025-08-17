/**
 * Hook for tracking user journey and engagement analytics
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAnalytics } from '../analytics/AnalyticsContext';

interface UserJourneyTrackingOptions {
  pageUrl?: string;
  pageName?: string;
}

export function useUserJourneyTracking(options: UserJourneyTrackingOptions = {}) {
  const analytics = useAnalytics();
  const pageStartTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);
  const maxScrollDepth = useRef<number>(0);
  const engagementEvents = useRef<string[]>([]);

  const trackPageView = useCallback((pageName?: string) => {
    pageStartTime.current = Date.now();
    
    analytics.trackUserJourney({
      event: 'page_view',
      category: 'user_journey',
      action: 'page_view',
      journeyStage: 'exploration',
      pageUrl: options.pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      label: pageName || options.pageName || 'unknown_page'
    });
  }, [analytics, options.pageUrl, options.pageName]);

  const trackScrollDepth = useCallback((depth: number) => {
    scrollDepth.current = depth;
    if (depth > maxScrollDepth.current) {
      maxScrollDepth.current = depth;
      
      // Track milestone scroll depths
      const milestones = [25, 50, 75, 90, 100];
      const milestone = milestones.find(m => depth >= m && maxScrollDepth.current < m);
      
      if (milestone) {
        analytics.trackUserJourney({
          event: 'scroll_depth',
          category: 'user_journey',
          action: 'scroll',
          journeyStage: 'engagement',
          pageUrl: options.pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
          scrollDepth: milestone,
          label: `scroll_${milestone}%`,
          value: milestone
        });
      }
    }
  }, [analytics, options.pageUrl]);

  const trackEngagement = useCallback((engagementType: string, value?: number) => {
    engagementEvents.current.push(engagementType);
    
    analytics.trackUserJourney({
      event: 'user_engagement',
      category: 'user_journey',
      action: 'engagement',
      journeyStage: 'engagement',
      pageUrl: options.pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
      scrollDepth: maxScrollDepth.current,
      label: `engagement_${engagementType}`,
      value,
      metadata: {
        engagementType,
        totalEngagements: engagementEvents.current.length,
        engagementHistory: engagementEvents.current.slice(-5) // Last 5 engagements
      }
    });
  }, [analytics, options.pageUrl]);

  const trackDiscovery = useCallback((discoveryType: string, discoveredItem: string) => {
    analytics.trackUserJourney({
      event: 'content_discovery',
      category: 'user_journey',
      action: 'discovery',
      journeyStage: 'game_discovery',
      pageUrl: options.pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
      scrollDepth: scrollDepth.current,
      label: `discovery_${discoveryType}`,
      metadata: {
        discoveryType,
        discoveredItem,
        timeToDiscovery: Date.now() - pageStartTime.current
      }
    });
  }, [analytics, options.pageUrl]);

  const trackConversionAttempt = useCallback((attemptType: string, context?: string) => {
    analytics.trackUserJourney({
      event: 'conversion_attempt',
      category: 'user_journey',
      action: 'conversion_attempt',
      journeyStage: 'conversion_attempt',
      pageUrl: options.pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
      timeOnPage: Date.now() - pageStartTime.current,
      scrollDepth: maxScrollDepth.current,
      label: `conversion_attempt_${attemptType}`,
      metadata: {
        attemptType,
        context,
        engagementCount: engagementEvents.current.length,
        timeToAttempt: Date.now() - pageStartTime.current
      }
    });
  }, [analytics, options.pageUrl]);

  const trackPageExit = useCallback(() => {
    const timeOnPage = Date.now() - pageStartTime.current;
    
    analytics.trackUserJourney({
      event: 'page_exit',
      category: 'user_journey',
      action: 'page_exit',
      journeyStage: 'exploration',
      pageUrl: options.pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
      timeOnPage,
      scrollDepth: maxScrollDepth.current,
      label: 'page_exit',
      value: timeOnPage,
      metadata: {
        engagementCount: engagementEvents.current.length,
        engagementTypes: [...new Set(engagementEvents.current)],
        maxScrollDepth: maxScrollDepth.current
      }
    });
  }, [analytics, options.pageUrl]);

  // Set up scroll tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      
      trackScrollDepth(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);

  // Track page exit on unmount
  useEffect(() => {
    return () => {
      trackPageExit();
    };
  }, [trackPageExit]);

  return {
    trackPageView,
    trackScrollDepth,
    trackEngagement,
    trackDiscovery,
    trackConversionAttempt,
    trackPageExit
  };
}