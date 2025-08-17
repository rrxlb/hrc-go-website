/**
 * Development dashboard for monitoring analytics in real-time
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAnalytics } from '@/lib/analytics/AnalyticsContext';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

interface AnalyticsDashboardProps {
  maxEvents?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  collapsed?: boolean;
}

export function AnalyticsDashboard({
  maxEvents = 50,
  position = 'bottom-right',
  collapsed = false
}: AnalyticsDashboardProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [filter, setFilter] = useState<string>('all');
  const analytics = useAnalytics();

  // Intercept analytics events for display
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    const originalTrack = analytics.track;
    
    analytics.track = function(event: any) {
      // Add to dashboard
      setEvents(prev => {
        const newEvents = [event, ...prev].slice(0, maxEvents);
        return newEvents;
      });
      
      // Call original function
      return originalTrack.call(this, event);
    };

    return () => {
      analytics.track = originalTrack;
    };
  }, [analytics, maxEvents]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getPositionClasses = () => {
    const base = 'fixed z-50 bg-black/90 text-white text-xs font-mono border border-gray-600 rounded-lg';
    
    switch (position) {
      case 'top-left':
        return `${base} top-4 left-4`;
      case 'top-right':
        return `${base} top-4 right-4`;
      case 'bottom-left':
        return `${base} bottom-4 left-4`;
      case 'bottom-right':
      default:
        return `${base} bottom-4 right-4`;
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.category === filter;
  });

  const eventCounts = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryColor = (category: string) => {
    const colors = {
      'game_interaction': 'text-blue-400',
      'conversion': 'text-green-400',
      'user_journey': 'text-yellow-400',
      'performance': 'text-red-400'
    };
    return colors[category as keyof typeof colors] || 'text-gray-400';
  };

  if (isCollapsed) {
    return (
      <div className={getPositionClasses()}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-800 rounded"
        >
          📊 Analytics ({events.length})
        </button>
      </div>
    );
  }

  return (
    <div className={`${getPositionClasses()} w-96 max-h-96 overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <h3 className="font-bold">Analytics Dashboard</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEvents([])}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            Clear
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
          >
            −
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-b border-gray-600 bg-gray-900/50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(eventCounts).map(([category, count]) => (
            <div key={category} className="flex justify-between">
              <span className={getCategoryColor(category)}>{category}:</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="p-2 border-b border-gray-600">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
        >
          <option value="all">All Events ({events.length})</option>
          {Object.keys(eventCounts).map(category => (
            <option key={category} value={category}>
              {category} ({eventCounts[category]})
            </option>
          ))}
        </select>
      </div>

      {/* Events List */}
      <div className="overflow-y-auto max-h-48">
        {filteredEvents.length === 0 ? (
          <div className="p-3 text-gray-500 text-center">
            No events yet...
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={`${event.timestamp}-${index}`}
              className="p-2 border-b border-gray-700 hover:bg-gray-800/50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold ${getCategoryColor(event.category)}`}>
                  {event.event}
                </span>
                <span className="text-gray-500 text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {event.action}
                {event.label && ` • ${event.label}`}
                {event.value !== undefined && ` • ${event.value}`}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Session Info */}
      <div className="p-2 border-t border-gray-600 bg-gray-900/50 text-xs text-gray-400">
        Session: {analytics.getSessionId().slice(-8)}
      </div>
    </div>
  );
}