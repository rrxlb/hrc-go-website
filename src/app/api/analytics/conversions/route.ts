/**
 * API route for handling conversion tracking events
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversionEvent } from '@/lib/analytics/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, sessionId, timestamp } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid conversion events data' },
        { status: 400 }
      );
    }

    // Validate conversion events
    const validConversions = events.filter((event: ConversionEvent) => {
      return event.event && 
             event.category === 'conversion' && 
             event.conversionType && 
             event.source &&
             event.timestamp;
    });

    if (validConversions.length === 0) {
      return NextResponse.json(
        { error: 'No valid conversion events found' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Store conversion events in a dedicated table
    // 2. Trigger conversion tracking pixels/webhooks
    // 3. Update conversion funnels and attribution models
    // 4. Send to marketing analytics platforms
    // 5. Calculate conversion rates and ROI metrics

    // For now, we'll log the conversions with special attention
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Conversions]', {
        sessionId,
        conversionCount: validConversions.length,
        conversions: validConversions.map(e => ({
          event: e.event,
          conversionType: e.conversionType,
          source: e.source,
          gameContext: e.gameContext,
          ctaPosition: e.ctaPosition,
          value: e.value
        }))
      });
    }

    // Track high-value conversions separately
    const discordCTAClicks = validConversions.filter(e => e.conversionType === 'discord_cta_click');
    const gameTryClicks = validConversions.filter(e => e.conversionType === 'game_try_click');

    if (discordCTAClicks.length > 0) {
      // In production: send to Discord webhook, update conversion dashboard
      console.log('[High Value Conversion] Discord CTA clicks:', discordCTAClicks.length);
    }

    if (gameTryClicks.length > 0) {
      // In production: track game interest, update game popularity metrics
      console.log('[Game Interest] Game try clicks:', gameTryClicks.length);
    }

    return NextResponse.json({
      success: true,
      processed: validConversions.length,
      discordCTAClicks: discordCTAClicks.length,
      gameTryClicks: gameTryClicks.length,
      sessionId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[Analytics Conversions] Error processing conversions:', error);
    
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