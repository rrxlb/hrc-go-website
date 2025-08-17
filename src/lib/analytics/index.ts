/**
 * Analytics system exports
 */

// Core analytics
export { AnalyticsManager } from './AnalyticsManager';
export { AnalyticsContextProvider, useAnalytics } from './AnalyticsContext';
export { getAnalyticsConfig, defaultAnalyticsConfig } from './config';

// Types
export type {
  AnalyticsEvent,
  GameInteractionEvent,
  ConversionEvent,
  UserJourneyEvent,
  PerformanceEvent,
  AnalyticsConfig,
  AnalyticsProvider
} from './types';

// Hooks
export { useGameAnalytics } from '../hooks/useGameAnalytics';
export { useConversionTracking } from '../hooks/useConversionTracking';
export { useUserJourneyTracking } from '../hooks/useUserJourneyTracking';
export { usePerformanceAnalytics } from '../hooks/usePerformanceAnalytics';

// Components
export { AnalyticsGameTable } from '../../components/analytics/AnalyticsGameTable';
export { AnalyticsDiscordCTA } from '../../components/analytics/AnalyticsDiscordCTA';
export { PerformanceTracker, useAnimationTracking } from '../../components/analytics/PerformanceTracker';
export { AnalyticsDashboard } from '../../components/analytics/AnalyticsDashboard';