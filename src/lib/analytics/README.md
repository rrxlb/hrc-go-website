# Analytics System

The High Roller Club website includes a comprehensive analytics system for tracking user interactions, conversions, user journey, and 3D performance metrics.

## Features

### 1. Game Interaction Tracking
- **Table Hover/Click Events**: Track when users interact with 3D game tables
- **View Duration**: Measure how long users view specific games
- **Demo Engagement**: Track game demonstration interactions
- **Camera Position Context**: Include 3D camera position for spatial analytics

### 2. Conversion Tracking
- **Discord CTA Clicks**: Track all Discord call-to-action button interactions
- **Game Try Clicks**: Monitor interest in specific games
- **Conversion Funnel**: Track user progression through awareness → conversion
- **External Link Tracking**: Monitor clicks to external resources

### 3. User Journey Analytics
- **Page Views**: Track navigation and page engagement
- **Scroll Depth**: Measure content consumption depth
- **Discovery Events**: Track when users discover new content
- **Engagement Metrics**: Monitor user interaction patterns
- **Session Duration**: Measure time spent on site

### 4. Performance Metrics
- **FPS Tracking**: Monitor 3D rendering performance
- **Memory Usage**: Track WebGL memory consumption
- **Load Times**: Measure asset loading performance
- **Animation Performance**: Track animation smoothness
- **Device Capabilities**: Monitor WebGL support and device info
- **Scene Complexity**: Track 3D scene rendering complexity

## Usage

### Basic Setup

```tsx
import { AnalyticsContextProvider } from '@/lib/analytics';

function App() {
  return (
    <AnalyticsContextProvider>
      {/* Your app content */}
    </AnalyticsContextProvider>
  );
}
```

### Game Analytics

```tsx
import { useGameAnalytics } from '@/lib/hooks/useGameAnalytics';

function GameTable({ gameId, gameType }) {
  const analytics = useGameAnalytics({ gameId, gameType });
  
  return (
    <mesh
      onPointerEnter={() => analytics.trackGameHover()}
      onClick={() => analytics.trackGameClick()}
    >
      {/* 3D game table */}
    </mesh>
  );
}
```

### Conversion Tracking

```tsx
import { AnalyticsDiscordCTA } from '@/components/analytics/AnalyticsDiscordCTA';

function HeroCTA() {
  return (
    <AnalyticsDiscordCTA
      position="hero_desktop"
      gameContext="blackjack"
      variant="primary"
    >
      Join Discord
    </AnalyticsDiscordCTA>
  );
}
```

### Performance Tracking

```tsx
import { PerformanceTracker } from '@/components/analytics/PerformanceTracker';

function CasinoScene() {
  return (
    <Canvas>
      <PerformanceTracker 
        trackingInterval={5000}
        enableMemoryTracking={true}
        enableSceneComplexityTracking={true}
      />
      {/* Your 3D scene */}
    </Canvas>
  );
}
```

### User Journey Tracking

```tsx
import { useUserJourneyTracking } from '@/lib/hooks/useUserJourneyTracking';

function GamePage() {
  const journey = useUserJourneyTracking({ pageName: 'games' });
  
  useEffect(() => {
    journey.trackPageView();
    journey.trackDiscovery('game_showcase', 'featured_games');
  }, []);
  
  return (
    <div onScroll={(e) => {
      const scrollPercent = (e.target.scrollTop / e.target.scrollHeight) * 100;
      journey.trackScrollDepth(scrollPercent);
    }}>
      {/* Page content */}
    </div>
  );
}
```

## Configuration

### Environment Variables

```bash
# Enable/disable analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# API endpoints
NEXT_PUBLIC_ANALYTICS_EVENTS_ENDPOINT=/api/analytics/events
NEXT_PUBLIC_ANALYTICS_PERFORMANCE_ENDPOINT=/api/analytics/performance
NEXT_PUBLIC_ANALYTICS_CONVERSIONS_ENDPOINT=/api/analytics/conversions

# Sampling rates (0.0 to 1.0)
NEXT_PUBLIC_ANALYTICS_PERFORMANCE_SAMPLING=0.1
NEXT_PUBLIC_ANALYTICS_INTERACTIONS_SAMPLING=1.0
NEXT_PUBLIC_ANALYTICS_CONVERSIONS_SAMPLING=1.0

# Discord Configuration
NEXT_PUBLIC_DISCORD_SERVER_INVITE=https://discord.gg/RK4K8tDsHB
NEXT_PUBLIC_DISCORD_BOT_INVITE=https://discord.com/oauth2/authorize?client_id=1396564026233983108&permissions=274878253072&integration_type=0&scope=applications.commands+bot
NEXT_PUBLIC_DISCORD_CLIENT_ID=1396564026233983108
```

### Custom Configuration

```tsx
import { AnalyticsManager } from '@/lib/analytics';

const customConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  batchSize: 20,
  flushInterval: 10000,
  endpoints: {
    events: '/api/custom/events',
    performance: '/api/custom/performance',
    conversions: '/api/custom/conversions'
  },
  sampling: {
    performance: 0.05, // 5% sampling
    interactions: 1.0,  // 100% sampling
    conversions: 1.0    // 100% sampling
  }
};

const analytics = new AnalyticsManager(customConfig);
```

## API Endpoints

### Events Endpoint (`/api/analytics/events`)
Handles general user interactions and journey events.

**Request Format:**
```json
{
  "events": [
    {
      "event": "game_hover",
      "category": "game_interaction",
      "action": "hover",
      "gameId": "blackjack",
      "timestamp": 1640995200000,
      "sessionId": "session_123",
      "metadata": { ... }
    }
  ],
  "sessionId": "session_123",
  "timestamp": 1640995200000
}
```

### Conversions Endpoint (`/api/analytics/conversions`)
Handles conversion tracking and CTA interactions.

**Request Format:**
```json
{
  "events": [
    {
      "event": "discord_cta_click",
      "category": "conversion",
      "conversionType": "discord_cta_click",
      "source": "hero_section",
      "ctaPosition": "floating",
      "timestamp": 1640995200000,
      "sessionId": "session_123"
    }
  ]
}
```

### Performance Endpoint (`/api/analytics/performance`)
Handles 3D rendering and performance metrics.

**Request Format:**
```json
{
  "events": [
    {
      "event": "fps_measurement",
      "category": "performance",
      "metricType": "fps",
      "value": 60,
      "deviceInfo": {
        "userAgent": "...",
        "webglSupport": true,
        "isMobile": false
      },
      "sceneComplexity": {
        "triangleCount": 50000,
        "textureCount": 12,
        "lightCount": 4
      }
    }
  ]
}
```

## Development Tools

### Analytics Dashboard
In development mode, an analytics dashboard is available to monitor events in real-time:

```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

// Automatically included in development builds
<AnalyticsDashboard position="bottom-right" />
```

### Debug Mode
Enable debug logging by setting `debug: true` in the analytics configuration or using the environment variable:

```bash
NODE_ENV=development
```

## Data Privacy

- All analytics data is anonymized by default
- No personally identifiable information (PII) is collected
- Session IDs are generated client-side and not linked to user accounts
- Users can opt-out of analytics tracking
- GDPR and CCPA compliant data handling

## Performance Considerations

- **Sampling**: Performance metrics use 10% sampling by default to reduce overhead
- **Batching**: Events are batched and sent periodically to minimize network requests
- **Async Processing**: All analytics operations are non-blocking
- **Memory Management**: Automatic cleanup of event queues and timers
- **Error Handling**: Graceful degradation when analytics services are unavailable

## Testing

Run the analytics tests:

```bash
npm test src/lib/analytics
npm test src/lib/hooks/useGameAnalytics
npm test src/lib/hooks/useConversionTracking
```

## Production Deployment

1. **Database Setup**: Configure a time-series database for analytics storage
2. **API Scaling**: Implement proper API rate limiting and caching
3. **Data Pipeline**: Set up data processing and aggregation pipelines
4. **Monitoring**: Add alerts for analytics system health
5. **Backup**: Implement data backup and retention policies

## Integration with External Services

The system can be extended to integrate with external analytics services:

- Google Analytics 4
- Mixpanel
- Amplitude
- Custom data warehouses
- Discord webhooks for conversion notifications