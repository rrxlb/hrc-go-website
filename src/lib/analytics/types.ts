/**
 * Analytics event types and interfaces for the High Roller Club website
 */

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface GameInteractionEvent extends AnalyticsEvent {
  category: 'game_interaction';
  gameId: string;
  gameType: string;
  interactionType: 'hover' | 'click' | 'view' | 'demo_start' | 'demo_complete';
  duration?: number;
  cameraPosition?: [number, number, number];
}

export interface ConversionEvent extends AnalyticsEvent {
  category: 'conversion';
  conversionType: 'discord_cta_click' | 'game_try_click' | 'navigation_click';
  source: string;
  gameContext?: string;
  ctaPosition?: string;
}

export interface UserJourneyEvent extends AnalyticsEvent {
  category: 'user_journey';
  journeyStage: 'landing' | 'exploration' | 'game_discovery' | 'engagement' | 'conversion_attempt';
  pageUrl: string;
  referrer?: string;
  timeOnPage?: number;
  scrollDepth?: number;
}

export interface PerformanceEvent extends AnalyticsEvent {
  category: 'performance';
  metricType: 'fps' | 'memory_usage' | 'load_time' | 'animation_performance' | 'webgl_capability';
  value: number;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    devicePixelRatio: number;
    webglSupport: boolean;
    isMobile: boolean;
  };
  sceneComplexity?: {
    triangleCount: number;
    textureCount: number;
    lightCount: number;
  };
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushInterval: number;
  endpoints: {
    events: string;
    performance: string;
    conversions: string;
  };
  sampling: {
    performance: number; // 0-1, percentage of events to track
    interactions: number;
    conversions: number;
  };
}

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
  trackGameInteraction(event: Omit<GameInteractionEvent, 'timestamp' | 'sessionId'>): void;
  trackConversion(event: Omit<ConversionEvent, 'timestamp' | 'sessionId'>): void;
  trackUserJourney(event: Omit<UserJourneyEvent, 'timestamp' | 'sessionId'>): void;
  trackPerformance(event: Omit<PerformanceEvent, 'timestamp' | 'sessionId'>): void;
  flush(): Promise<void>;
  setUserId(userId: string): void;
  getSessionId(): string;
}