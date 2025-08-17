/**
 * API route for handling performance metrics tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { PerformanceEvent } from '@/lib/analytics/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, sessionId, timestamp } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid performance events data' },
        { status: 400 }
      );
    }

    // Validate performance events
    const validPerformanceEvents = events.filter((event: PerformanceEvent) => {
      return event.event && 
             event.category === 'performance' && 
             event.metricType && 
             typeof event.value === 'number' &&
             event.deviceInfo &&
             event.timestamp;
    });

    if (validPerformanceEvents.length === 0) {
      return NextResponse.json(
        { error: 'No valid performance events found' },
        { status: 400 }
      );
    }

    // Analyze performance metrics
    const fpsEvents = validPerformanceEvents.filter(e => e.metricType === 'fps');
    const memoryEvents = validPerformanceEvents.filter(e => e.metricType === 'memory_usage');
    const loadTimeEvents = validPerformanceEvents.filter(e => e.metricType === 'load_time');
    const animationEvents = validPerformanceEvents.filter(e => e.metricType === 'animation_performance');

    // Calculate performance insights
    const performanceInsights = {
      avgFPS: fpsEvents.length > 0 ? fpsEvents.reduce((sum, e) => sum + e.value, 0) / fpsEvents.length : null,
      avgMemoryUsage: memoryEvents.length > 0 ? memoryEvents.reduce((sum, e) => sum + e.value, 0) / memoryEvents.length : null,
      avgLoadTime: loadTimeEvents.length > 0 ? loadTimeEvents.reduce((sum, e) => sum + e.value, 0) / loadTimeEvents.length : null,
      poorPerformanceCount: fpsEvents.filter(e => e.value < 30).length,
      highMemoryUsageCount: memoryEvents.filter(e => e.value > 100).length, // > 100MB
      slowLoadCount: loadTimeEvents.filter(e => e.value > 3000).length // > 3 seconds
    };

    // In a real implementation, you would:
    // 1. Store performance metrics in a time-series database
    // 2. Set up alerts for performance degradation
    // 3. Create performance dashboards and reports
    // 4. Correlate performance with user behavior
    // 5. Optimize based on performance patterns

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Performance]', {
        sessionId,
        eventCount: validPerformanceEvents.length,
        insights: performanceInsights,
        deviceTypes: [...new Set(validPerformanceEvents.map(e => e.deviceInfo.isMobile ? 'mobile' : 'desktop'))],
        webglSupport: validPerformanceEvents.some(e => e.deviceInfo.webglSupport)
      });
    }

    // Flag critical performance issues
    if (performanceInsights.avgFPS && performanceInsights.avgFPS < 20) {
      console.warn('[Performance Alert] Critical FPS issues detected:', {
        sessionId,
        avgFPS: performanceInsights.avgFPS,
        poorPerformanceCount: performanceInsights.poorPerformanceCount
      });
    }

    if (performanceInsights.avgMemoryUsage && performanceInsights.avgMemoryUsage > 200) {
      console.warn('[Performance Alert] High memory usage detected:', {
        sessionId,
        avgMemoryUsage: performanceInsights.avgMemoryUsage,
        highMemoryUsageCount: performanceInsights.highMemoryUsageCount
      });
    }

    return NextResponse.json({
      success: true,
      processed: validPerformanceEvents.length,
      insights: performanceInsights,
      sessionId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[Analytics Performance] Error processing performance events:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}