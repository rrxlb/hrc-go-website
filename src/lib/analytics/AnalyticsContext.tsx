/**
 * React context for analytics throughout the application
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { AnalyticsManager } from './AnalyticsManager';
import { AnalyticsProvider } from './types';
import { getAnalyticsConfig } from './config';

interface AnalyticsContextType {
  analytics: AnalyticsProvider;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsContextProvider({ children }: AnalyticsProviderProps) {
  const analyticsRef = useRef<AnalyticsManager | null>(null);

  useEffect(() => {
    if (!analyticsRef.current) {
      const config = getAnalyticsConfig();
      analyticsRef.current = new AnalyticsManager(config);
    }

    return () => {
      if (analyticsRef.current) {
        analyticsRef.current.destroy();
      }
    };
  }, []);

  if (!analyticsRef.current) {
    // Create a no-op analytics provider for SSR
    const noOpAnalytics: AnalyticsProvider = {
      track: () => {},
      trackGameInteraction: () => {},
      trackConversion: () => {},
      trackUserJourney: () => {},
      trackPerformance: () => {},
      flush: async () => {},
      setUserId: () => {},
      getSessionId: () => 'ssr-session'
    };

    return (
      <AnalyticsContext.Provider value={{ analytics: noOpAnalytics }}>
        {children}
      </AnalyticsContext.Provider>
    );
  }

  return (
    <AnalyticsContext.Provider value={{ analytics: analyticsRef.current }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsProvider {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsContextProvider');
  }
  return context.analytics;
}