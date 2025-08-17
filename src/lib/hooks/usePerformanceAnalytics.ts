/**
 * Hook for tracking 3D rendering and animation performance metrics
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAnalytics } from '../analytics/AnalyticsContext';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  triangleCount?: number;
  textureCount?: number;
  lightCount?: number;
}

interface DeviceInfo {
  userAgent: string;
  screenResolution: string;
  devicePixelRatio: number;
  webglSupport: boolean;
  isMobile: boolean;
}

export function usePerformanceAnalytics() {
  const analytics = useAnalytics();
  const performanceData = useRef<{
    frameCount: number;
    lastTime: number;
    fpsHistory: number[];
    memoryHistory: number[];
  }>({
    frameCount: 0,
    lastTime: performance.now(),
    fpsHistory: [],
    memoryHistory: []
  });

  const getDeviceInfo = useCallback((): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        screenResolution: '',
        devicePixelRatio: 1,
        webglSupport: false,
        isMobile: false
      };
    }

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const webglSupport = !!gl;

    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      devicePixelRatio: window.devicePixelRatio || 1,
      webglSupport,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
  }, []);

  const trackFPS = useCallback((fps: number) => {
    const data = performanceData.current;
    data.fpsHistory.push(fps);
    
    // Keep only last 60 measurements (roughly 1 second at 60fps)
    if (data.fpsHistory.length > 60) {
      data.fpsHistory.shift();
    }

    // Track significant FPS drops
    if (fps < 30 && data.fpsHistory.length > 10) {
      const avgFps = data.fpsHistory.reduce((a, b) => a + b, 0) / data.fpsHistory.length;
      
      analytics.trackPerformance({
        event: 'fps_drop',
        category: 'performance',
        action: 'fps_measurement',
        metricType: 'fps',
        value: fps,
        deviceInfo: getDeviceInfo(),
        label: 'fps_drop',
        metadata: {
          averageFps: avgFps,
          fpsHistory: data.fpsHistory.slice(-10)
        }
      });
    }
  }, [analytics, getDeviceInfo]);

  const trackMemoryUsage = useCallback((memoryMB: number) => {
    const data = performanceData.current;
    data.memoryHistory.push(memoryMB);
    
    // Keep only last 20 measurements
    if (data.memoryHistory.length > 20) {
      data.memoryHistory.shift();
    }

    analytics.trackPerformance({
      event: 'memory_usage',
      category: 'performance',
      action: 'memory_measurement',
      metricType: 'memory_usage',
      value: memoryMB,
      deviceInfo: getDeviceInfo(),
      label: 'memory_usage',
      metadata: {
        memoryHistory: data.memoryHistory.slice(-5)
      }
    });
  }, [analytics, getDeviceInfo]);

  const trackLoadTime = useCallback((loadTimeMs: number, assetType: string) => {
    analytics.trackPerformance({
      event: 'load_time',
      category: 'performance',
      action: 'load_measurement',
      metricType: 'load_time',
      value: loadTimeMs,
      deviceInfo: getDeviceInfo(),
      label: `load_time_${assetType}`,
      metadata: {
        assetType,
        loadTimeSeconds: loadTimeMs / 1000
      }
    });
  }, [analytics, getDeviceInfo]);

  const trackAnimationPerformance = useCallback((
    animationName: string, 
    duration: number, 
    frameDrops: number
  ) => {
    analytics.trackPerformance({
      event: 'animation_performance',
      category: 'performance',
      action: 'animation_measurement',
      metricType: 'animation_performance',
      value: frameDrops,
      deviceInfo: getDeviceInfo(),
      label: `animation_${animationName}`,
      metadata: {
        animationName,
        duration,
        frameDrops,
        frameDropRate: frameDrops / (duration / 16.67) // Expected frames at 60fps
      }
    });
  }, [analytics, getDeviceInfo]);

  const trackSceneComplexity = useCallback((complexity: {
    triangleCount: number;
    textureCount: number;
    lightCount: number;
  }) => {
    analytics.trackPerformance({
      event: 'scene_complexity',
      category: 'performance',
      action: 'complexity_measurement',
      metricType: 'fps', // Use fps as base metric type
      value: complexity.triangleCount,
      deviceInfo: getDeviceInfo(),
      sceneComplexity: complexity,
      label: 'scene_complexity',
      metadata: {
        ...complexity,
        complexityScore: complexity.triangleCount + (complexity.textureCount * 100) + (complexity.lightCount * 50)
      }
    });
  }, [analytics, getDeviceInfo]);

  const trackWebGLCapability = useCallback(() => {
    if (typeof window === 'undefined') return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      const webglContext = gl as WebGLRenderingContext;
      const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
      const renderer = debugInfo ? webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
      
      analytics.trackPerformance({
        event: 'webgl_capability',
        category: 'performance',
        action: 'capability_check',
        metricType: 'webgl_capability',
        value: 1,
        deviceInfo: getDeviceInfo(),
        label: 'webgl_supported',
        metadata: {
          vendor,
          renderer,
          webglVersion: webglContext.getParameter(webglContext.VERSION),
          maxTextureSize: webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE),
          maxVertexAttribs: webglContext.getParameter(webglContext.MAX_VERTEX_ATTRIBS)
        }
      });
    } else {
      analytics.trackPerformance({
        event: 'webgl_capability',
        category: 'performance',
        action: 'capability_check',
        metricType: 'webgl_capability',
        value: 0,
        deviceInfo: getDeviceInfo(),
        label: 'webgl_not_supported'
      });
    }
  }, [analytics, getDeviceInfo]);

  const startPerformanceMonitoring = useCallback(() => {
    if (typeof window === 'undefined') return;

    let animationId: number;
    
    const monitor = () => {
      const now = performance.now();
      const data = performanceData.current;
      
      data.frameCount++;
      const deltaTime = now - data.lastTime;
      
      if (deltaTime >= 1000) { // Update every second
        const fps = Math.round((data.frameCount * 1000) / deltaTime);
        trackFPS(fps);
        
        // Track memory if available
        if ('memory' in performance) {
          const memoryMB = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
          trackMemoryUsage(memoryMB);
        }
        
        data.frameCount = 0;
        data.lastTime = now;
      }
      
      animationId = requestAnimationFrame(monitor);
    };
    
    animationId = requestAnimationFrame(monitor);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [trackFPS, trackMemoryUsage]);

  // Initialize WebGL capability tracking on mount
  useEffect(() => {
    trackWebGLCapability();
  }, [trackWebGLCapability]);

  return {
    trackFPS,
    trackMemoryUsage,
    trackLoadTime,
    trackAnimationPerformance,
    trackSceneComplexity,
    trackWebGLCapability,
    startPerformanceMonitoring
  };
}