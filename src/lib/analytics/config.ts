/**
 * Analytics configuration for the High Roller Club website
 */

import { AnalyticsConfig } from './types';

export const defaultAnalyticsConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  endpoints: {
    events: process.env.NEXT_PUBLIC_ANALYTICS_EVENTS_ENDPOINT || '/api/analytics/events',
    performance: process.env.NEXT_PUBLIC_ANALYTICS_PERFORMANCE_ENDPOINT || '/api/analytics/performance',
    conversions: process.env.NEXT_PUBLIC_ANALYTICS_CONVERSIONS_ENDPOINT || '/api/analytics/conversions'
  },
  sampling: {
    performance: parseFloat(process.env.NEXT_PUBLIC_ANALYTICS_PERFORMANCE_SAMPLING || '0.1'), // 10% sampling for performance
    interactions: parseFloat(process.env.NEXT_PUBLIC_ANALYTICS_INTERACTIONS_SAMPLING || '1.0'), // 100% sampling for interactions
    conversions: parseFloat(process.env.NEXT_PUBLIC_ANALYTICS_CONVERSIONS_SAMPLING || '1.0') // 100% sampling for conversions
  }
};

export const getAnalyticsConfig = (): AnalyticsConfig => {
  return {
    ...defaultAnalyticsConfig,
    // Override with environment-specific settings if needed
    enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' || defaultAnalyticsConfig.enabled
  };
};