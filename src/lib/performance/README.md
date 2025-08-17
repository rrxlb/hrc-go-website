# Performance Monitoring and Optimization System

This document describes the comprehensive performance monitoring and optimization system implemented for the High Roller Club website.

## Overview

The performance system consists of several interconnected components that work together to monitor, optimize, and maintain optimal performance across the casino website:

1. **Performance Monitor** - Core monitoring and metrics collection
2. **Animation Manager** - Optimized animation loop management
3. **Performance Asset Loader** - Network-aware asset loading
4. **Three.js Memory Manager** - WebGL memory management
5. **Performance Optimization Hook** - React integration
6. **Performance Monitor Component** - Debug visualization

## Components

### 1. Performance Monitor (`performanceMonitor.ts`)

**Features:**
- FPS monitoring with automatic quality adjustment
- Memory usage tracking (JS heap and Three.js specific)
- Render time measurement
- Frame drop detection
- Network connection awareness
- Automatic cleanup management

**Key Methods:**
- `startFPSMonitoring(targetFPS)` - Begin FPS tracking
- `trackThreeJSMemory()` - Monitor WebGL memory usage
- `performCleanup()` - Clean up resources and callbacks

### 2. Animation Manager (`animationManager.ts`)

**Features:**
- Priority-based animation loop execution
- Adaptive frame rate adjustment
- Frame skipping for performance
- Automatic cleanup on component unmount
- Performance-based optimization

**Key Methods:**
- `addLoop(id, callback, priority, targetFPS)` - Register animation loop
- `optimizeForPerformance()` - Disable low-priority animations
- `getPerformanceMetrics()` - Get current performance data

### 3. Performance Asset Loader (`performanceAssetLoader.ts`)

**Features:**
- Network-aware asset loading (slow/medium/fast variants)
- Memory budget management
- Progressive loading with priority system
- Retry logic with exponential backoff
- Fallback asset support

**Key Methods:**
- `addAsset(asset)` - Queue asset for loading
- `loadAssets()` - Execute loading with performance awareness
- `getMemoryUsage()` - Track current memory consumption

### 4. Three.js Memory Manager (`threeJSMemoryManager.ts`)

**Features:**
- Automatic tracking of geometries, textures, and materials
- Memory budget enforcement
- Periodic cleanup of unused objects
- Emergency cleanup when over budget
- Integration with Three.js disposal methods

**Key Methods:**
- `trackGeometry(geometry, id)` - Track geometry memory
- `trackTexture(texture, id)` - Track texture memory
- `optimizeMemory()` - Force memory optimization

### 5. Performance Optimization Hook (`usePerformanceOptimization.ts`)

**Features:**
- Unified performance management for React components
- Automatic quality level adjustment
- Performance warnings and recommendations
- Device capability awareness
- Real-time metrics reporting

**Key Methods:**
- `optimizePerformance()` - Manual optimization trigger
- `setQualityLevel(level)` - Override quality settings
- `getPerformanceAnalytics()` - Get detailed performance data

### 6. Performance Monitor Component (`PerformanceMonitor.tsx`)

**Features:**
- Real-time performance visualization
- Interactive quality controls
- Memory usage display
- Warning system
- Development-only debug interface

## Usage Examples

### Basic Performance Monitoring

```typescript
import { usePerformanceOptimization } from '@/lib/hooks/usePerformanceOptimization';

function MyComponent() {
  const { performanceState, qualitySettings, optimizePerformance } = usePerformanceOptimization({
    targetFPS: 60,
    memoryBudgetMB: 100,
    autoQualityAdjustment: true
  });

  // Use qualitySettings to configure Three.js renderer
  // Monitor performanceState for warnings
  // Call optimizePerformance() when needed
}
```

### Animation Loop Management

```typescript
import { useAnimationLoop } from '@/lib/utils/animationManager';

function AnimatedComponent() {
  useAnimationLoop('my-animation', (deltaTime, elapsedTime) => {
    // Animation logic here
    updateAnimation(deltaTime);
  }, 'medium', 60);
}
```

### Asset Loading with Performance Awareness

```typescript
import { performanceAssetLoader, createLoadingStrategy, createNetworkAwareAsset } from '@/lib/utils/performanceAssetLoader';

// Create performance-aware asset
const strategy = createLoadingStrategy('high', {
  loadCondition: () => true,
  maxRetries: 3,
  timeout: 5000
});

const asset = createNetworkAwareAsset(
  'casino-texture',
  '/textures/casino-floor.jpg',
  'texture',
  1024 * 1024, // 1MB
  strategy,
  {
    slow: '/textures/casino-floor-low.jpg',
    medium: '/textures/casino-floor-med.jpg',
    fast: '/textures/casino-floor-high.jpg'
  }
);

performanceAssetLoader.addAsset(asset);
const loadedAssets = await performanceAssetLoader.loadAssets();
```

### Three.js Memory Management

```typescript
import { useThreeJSMemoryManagement } from '@/lib/utils/threeJSMemoryManager';

function ThreeJSComponent({ renderer }) {
  const { trackGeometry, trackTexture, getStats } = useThreeJSMemoryManagement(renderer);

  // Track resources
  trackGeometry(geometry, 'table-geometry');
  trackTexture(texture, 'felt-texture');

  // Monitor usage
  const memoryStats = getStats();
}
```

## Performance Targets

- **FPS**: 60fps on desktop, 30fps on mobile
- **Memory**: <100MB total, <50MB on mobile
- **Loading**: <3s initial load, <1s asset loading
- **Frame Time**: <16.67ms (60fps) or <33.33ms (30fps)

## Quality Levels

### High Quality
- Full resolution textures (1024px+)
- All animations enabled
- Anti-aliasing enabled
- High shadow map resolution (2048px)
- No LOD system

### Medium Quality
- Reduced texture resolution (512px)
- Some animations disabled
- Conditional anti-aliasing
- Medium shadow maps (1024px)
- LOD system enabled

### Low Quality
- Low resolution textures (256px)
- Minimal animations
- No anti-aliasing
- Low shadow maps (512px)
- Aggressive LOD system

## Monitoring and Debugging

### Development Mode
- Performance monitor overlay available
- Real-time metrics display
- Interactive quality controls
- Memory usage visualization

### Production Mode
- Automatic performance optimization
- Error reporting and analytics
- Graceful degradation
- User-friendly fallbacks

## Testing

Comprehensive test suites are provided for all components:

- `performanceAssetLoader.test.ts` - Asset loading scenarios
- `animationManager.test.ts` - Animation loop management
- `performanceMonitor.test.ts` - Core monitoring functionality
- `threeJSMemoryManager.test.ts` - Memory management

Run tests with:
```bash
npm test -- --run src/lib/utils/__tests__/performance*.test.ts
```

## Integration Points

The performance system integrates with:

- **Three.js Renderer** - Memory tracking and quality adjustment
- **React Components** - Automatic cleanup and optimization
- **Asset Loading** - Network-aware progressive loading
- **Animation System** - Priority-based execution
- **Device Detection** - Capability-aware optimization

## Future Enhancements

- WebWorker integration for heavy computations
- Service Worker caching strategies
- Advanced predictive loading
- Machine learning-based optimization
- Real-time performance analytics dashboard