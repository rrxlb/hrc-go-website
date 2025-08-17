/**
 * API route for handling general analytics events
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent } from '@/lib/analytics/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, sessionId, timestamp } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events data' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = events.filter((event: AnalyticsEvent) => {
      return event.event && event.category && event.action && event.timestamp;
    });

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: 'No valid events found' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Store events in a database (e.g., PostgreSQL, MongoDB)
    // 2. Send to analytics service (e.g., Google Analytics, Mixpanel)
    // 3. Queue for batch processing
    // 4. Apply data validation and sanitization

    // For now, we'll log the events (in production, remove console.log)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Events]', {
        sessionId,
        eventCount: validEvents.length,
        events: validEvents.map(e => ({
          event: e.event,
          category: e.category,
          action: e.action,
          label: e.label,
          value: e.value
        }))
      });
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 10));

    return NextResponse.json({
      success: true,
      processed: validEvents.length,
      sessionId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[Analytics Events] Error processing events:', error);
    
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