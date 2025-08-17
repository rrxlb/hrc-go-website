interface PerformanceMetrics {
  loadTime: number;
  assetCount: number;
  failedAssets: number;
  memoryUsage?: number;
  connectionType?: string;
  fps?: number;
  frameDrops?: number;
  renderTime?: number;
  threeJSMemory?: ThreeJSMemoryInfo;
}

interface ThreeJSMemoryInfo {
  geometries: number;
  textures: number;
  programs: number;
  calls: number;
  triangles: number;
  points: number;
  lines: number;
}

interface LoadingEvent {
  timestamp: number;
  event: 'start' | 'progress' | 'complete' | 'error';
  asset?: string;
  progress?: number;
}

class PerformanceMonitor {
  private startTime: number = 0;
  private events: LoadingEvent[] = [];
  private metrics: Partial<PerformanceMetrics> = {};
  private fpsMonitoringActive: boolean = false;
  private frameCount: number = 0;
  private lastFPSTime: number = 0;
  private frameDropCount: number = 0;
  private renderTimes: number[] = [];
  private animationFrameId?: number;
  private threeRenderer?: any; // THREE.WebGLRenderer
  private cleanupCallbacks: (() => void)[] = [];

  startMonitoring() {
    this.startTime = performance.now();
    this.events = [];
    this.logEvent('start');
    
    // Detect connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection?.effectiveType || 'unknown';
    }
  }

  // FPS Monitoring
  startFPSMonitoring(targetFPS: number = 60) {
    if (this.fpsMonitoringActive) return;
    
    this.fpsMonitoringActive = true;
    this.frameCount = 0;
    this.lastFPSTime = performance.now();
    this.frameDropCount = 0;
    
    const measureFPS = () => {
      if (!this.fpsMonitoringActive) return;
      
      const now = performance.now();
      this.frameCount++;
      
      // Calculate FPS every second
      if (now - this.lastFPSTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / (now - this.lastFPSTime));
        
        // Detect frame drops
        if (fps < targetFPS * 0.8) {
          this.frameDropCount++;
        }
        
        this.metrics.fps = fps;
        this.metrics.frameDrops = this.frameDropCount;
        
        this.frameCount = 0;
        this.lastFPSTime = now;
        
        // Auto quality adjustment if performance is poor
        if (fps < targetFPS * 0.6) {
          this.triggerQualityAdjustment('low');
        } else if (fps < targetFPS * 0.8) {
          this.triggerQualityAdjustment('medium');
        }
      }
      
      this.animationFrameId = requestAnimationFrame(measureFPS);
    };
    
    this.animationFrameId = requestAnimationFrame(measureFPS);
  }

  stopFPSMonitoring() {
    this.fpsMonitoringActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  // Render time tracking
  startRenderMeasurement(): number {
    return performance.now();
  }

  endRenderMeasurement(startTime: number) {
    const renderTime = performance.now() - startTime;
    this.renderTimes.push(renderTime);
    
    // Keep only last 60 measurements
    if (this.renderTimes.length > 60) {
      this.renderTimes.shift();
    }
    
    const avgRenderTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
    this.metrics.renderTime = avgRenderTime;
    
    return renderTime;
  }

  // Three.js memory tracking
  setThreeRenderer(renderer: any) {
    this.threeRenderer = renderer;
  }

  trackThreeJSMemory() {
    if (!this.threeRenderer) return;
    
    const info = this.threeRenderer.info;
    this.metrics.threeJSMemory = {
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs?.length || 0,
      calls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines
    };
    
    // Memory cleanup warnings
    if (info.memory.textures > 50) {
      console.warn('⚠️ High texture count detected:', info.memory.textures);
    }
    
    if (info.memory.geometries > 100) {
      console.warn('⚠️ High geometry count detected:', info.memory.geometries);
    }
  }

  // Cleanup management
  addCleanupCallback(callback: () => void) {
    this.cleanupCallbacks.push(callback);
  }

  performCleanup() {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    });
    this.cleanupCallbacks = [];
    
    // Three.js specific cleanup
    if (this.threeRenderer) {
      this.threeRenderer.dispose();
    }
    
    this.stopFPSMonitoring();
  }

  private triggerQualityAdjustment(level: 'high' | 'medium' | 'low') {
    // Dispatch custom event for quality adjustment
    window.dispatchEvent(new CustomEvent('performance-quality-adjust', {
      detail: { level, metrics: this.metrics }
    }));
  }

  logProgress(progress: number, asset?: string) {
    this.logEvent('progress', asset, progress);
  }

  logError(asset: string) {
    this.logEvent('error', asset);
    this.metrics.failedAssets = (this.metrics.failedAssets || 0) + 1;
  }

  completeMonitoring(assetCount: number) {
    const loadTime = performance.now() - this.startTime;
    this.logEvent('complete');
    
    this.metrics = {
      ...this.metrics,
      loadTime,
      assetCount,
      failedAssets: this.metrics.failedAssets || 0,
    };

    // Get memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }

    this.reportMetrics();
    return this.metrics as PerformanceMetrics;
  }

  private logEvent(event: LoadingEvent['event'], asset?: string, progress?: number) {
    this.events.push({
      timestamp: performance.now(),
      event,
      asset,
      progress,
    });
  }

  private reportMetrics() {
    // Log performance metrics for debugging
    console.group('🎰 Casino Performance Metrics');
    console.log('Load Time:', `${this.metrics.loadTime?.toFixed(2)}ms`);
    console.log('Assets Loaded:', this.metrics.assetCount);
    console.log('Failed Assets:', this.metrics.failedAssets);
    console.log('Connection Type:', this.metrics.connectionType);
    
    if (this.metrics.fps) {
      console.log('Current FPS:', this.metrics.fps);
      console.log('Frame Drops:', this.metrics.frameDrops);
    }
    
    if (this.metrics.renderTime) {
      console.log('Avg Render Time:', `${this.metrics.renderTime.toFixed(2)}ms`);
    }
    
    if (this.metrics.memoryUsage) {
      console.log('JS Memory Usage:', `${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    
    if (this.metrics.threeJSMemory) {
      console.log('Three.js Memory:', this.metrics.threeJSMemory);
    }

    // Performance warnings
    if (this.metrics.loadTime && this.metrics.loadTime > 5000) {
      console.warn('⚠️ Slow loading detected (>5s). Consider optimizing assets.');
    }

    if (this.metrics.failedAssets && this.metrics.failedAssets > 0) {
      console.warn(`⚠️ ${this.metrics.failedAssets} assets failed to load.`);
    }
    
    if (this.metrics.fps && this.metrics.fps < 30) {
      console.warn('⚠️ Low FPS detected. Performance optimization recommended.');
    }
    
    if (this.metrics.threeJSMemory?.textures && this.metrics.threeJSMemory.textures > 50) {
      console.warn('⚠️ High texture memory usage. Consider texture optimization.');
    }

    console.groupEnd();

    // Send metrics to analytics (if configured)
    this.sendAnalytics();
  }

  private sendAnalytics() {
    // This would integrate with your analytics service
    // For now, we'll just store in sessionStorage for debugging
    try {
      const analyticsData = {
        ...this.metrics,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      sessionStorage.setItem('casino-loading-metrics', JSON.stringify(analyticsData));
    } catch (error) {
      console.warn('Failed to store analytics data:', error);
    }
  }

  getEvents() {
    return [...this.events];
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common performance checks
export function isSlowConnection(): boolean {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
  }
  return false;
}

export function getDeviceCapabilities() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl || !('getParameter' in gl)) {
    return { webgl: false, maxTextureSize: 0 };
  }

  // Type assertion since we've checked that getParameter exists
  const webglContext = gl as WebGLRenderingContext;
  const maxTextureSize = webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE);
  const renderer = webglContext.getParameter(webglContext.RENDERER);
  
  return {
    webgl: true,
    maxTextureSize,
    renderer,
    vendor: webglContext.getParameter(webglContext.VENDOR),
  };
}

export function shouldReduceQuality(): boolean {
  // Check for various indicators that we should reduce quality
  const capabilities = getDeviceCapabilities();
  const isSlowConn = isSlowConnection();
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return (
    !capabilities.webgl ||
    capabilities.maxTextureSize < 2048 ||
    isSlowConn ||
    (isMobile && window.innerWidth < 768)
  );
}