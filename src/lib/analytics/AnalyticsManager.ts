/**
 * Core analytics manager for tracking user interactions, conversions, and performance
 */

import { 
  AnalyticsEvent, 
  AnalyticsProvider, 
  AnalyticsConfig,
  GameInteractionEvent,
  ConversionEvent,
  UserJourneyEvent,
  PerformanceEvent
} from './types';

export class AnalyticsManager implements AnalyticsProvider {
  private config: AnalyticsConfig;
  private sessionId: string;
  private userId?: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined' || !this.config.enabled) {
      return;
    }

    this.isInitialized = true;
    this.startFlushTimer();
    
    // Track initial page load
    this.trackUserJourney({
      event: 'page_load',
      category: 'user_journey',
      action: 'page_load',
      journeyStage: 'landing',
      pageUrl: window.location.href,
      referrer: document.referrer || undefined
    });

    // Set up beforeunload handler to flush remaining events
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    if (this.config.debug) {
      console.log('[Analytics] Initialized with session ID:', this.sessionId);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private shouldSample(category: string): boolean {
    // Map categories to sampling configuration keys
    const samplingKey = category === 'performance' ? 'performance' :
                       category === 'game_interaction' ? 'interactions' :
                       category === 'conversion' ? 'conversions' :
                       'interactions'; // default fallback
    
    const samplingRate = this.config.sampling[samplingKey as keyof typeof this.config.sampling] || 1;
    return Math.random() < samplingRate;
  }

  track(event: AnalyticsEvent): void {
    if (!this.isInitialized || !this.config.enabled) {
      return;
    }

    if (!this.shouldSample(event.category)) {
      return;
    }

    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      metadata: {
        ...event.metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      }
    };

    this.eventQueue.push(enrichedEvent);

    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', enrichedEvent);
    }

    // Flush immediately if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  trackGameInteraction(event: Omit<GameInteractionEvent, 'timestamp' | 'sessionId'>): void {
    const gameEvent: GameInteractionEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    this.track(gameEvent);
  }

  trackConversion(event: Omit<ConversionEvent, 'timestamp' | 'sessionId'>): void {
    const conversionEvent: ConversionEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    this.track(conversionEvent);
  }

  trackUserJourney(event: Omit<UserJourneyEvent, 'timestamp' | 'sessionId'>): void {
    const journeyEvent: UserJourneyEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    this.track(journeyEvent);
  }

  trackPerformance(event: Omit<PerformanceEvent, 'timestamp' | 'sessionId'>): void {
    const performanceEvent: PerformanceEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    this.track(performanceEvent);
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isInitialized) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Group events by category for different endpoints
      const gameInteractions = eventsToSend.filter(e => e.category === 'game_interaction');
      const conversions = eventsToSend.filter(e => e.category === 'conversion');
      const performance = eventsToSend.filter(e => e.category === 'performance');
      const userJourney = eventsToSend.filter(e => e.category === 'user_journey');

      // Send to different endpoints based on event type
      const promises: Promise<void>[] = [];

      if (gameInteractions.length > 0 || userJourney.length > 0) {
        promises.push(this.sendEvents([...gameInteractions, ...userJourney], this.config.endpoints.events));
      }

      if (conversions.length > 0) {
        promises.push(this.sendEvents(conversions, this.config.endpoints.conversions));
      }

      if (performance.length > 0) {
        promises.push(this.sendEvents(performance, this.config.endpoints.performance));
      }

      await Promise.all(promises);

      if (this.config.debug) {
        console.log('[Analytics] Flushed', eventsToSend.length, 'events');
      }
    } catch (error) {
      // Re-queue events if sending failed
      this.eventQueue.unshift(...eventsToSend);
      
      if (this.config.debug) {
        console.error('[Analytics] Failed to flush events:', error);
      }
    }
  }

  private async sendEvents(events: AnalyticsEvent[], endpoint: string): Promise<void> {
    if (events.length === 0) return;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        sessionId: this.sessionId,
        timestamp: Date.now()
      }),
      keepalive: true // Ensure events are sent even during page unload
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.status}`);
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
    
    // Track user identification
    this.track({
      event: 'user_identified',
      category: 'user_journey',
      action: 'identify',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId,
      metadata: { previousUserId: this.userId }
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
    this.isInitialized = false;
  }
}