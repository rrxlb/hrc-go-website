'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  frameDrops: number;
  qualityLevel: 'high' | 'medium' | 'low';
}

interface PerformanceSettings {
  targetFPS: number;
  maxMemoryUsage: number;
  autoAdjustQuality: boolean;
  enableMonitoring: boolean;
}

export function usePerformanceMonitor(settings: PerformanceSettings) {
  const capabilities = useDeviceCapabilities();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    frameDrops: 0,
    qualityLevel: 'high'
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const frameDropCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // FPS monitoring
  const measureFPS = () => {
    const now = performance.now();
    const delta = now - lastTime.current;
    
    frameCount.current++;
    
    // Calculate FPS every second
    if (delta >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / delta);
      
      // Detect frame drops
      if (fps < settings.targetFPS * 0.8) {
        frameDropCount.current++;
      }
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        fps,
        frameDrops: frameDropCount.current
      }));
      
      frameCount.current = 0;
      lastTime.current = now;
      
      // Auto-adjust quality if enabled
      if (settings.autoAdjustQuality) {
        adjustQualityBasedOnPerformance(fps);
      }
    }
    
    if (settings.enableMonitoring) {
      animationFrameId.current = requestAnimationFrame(measureFPS);
    }
  };

  // Memory monitoring
  const measureMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));
      
      // Check for memory pressure
      if (memoryUsage > settings.maxMemoryUsage && settings.autoAdjustQuality) {
        adjustQualityBasedOnMemory(memoryUsage);
      }
    }
  };

  // Render time monitoring
  const measureRenderTime = (startTime: number, endTime: number) => {
    const renderTime = endTime - startTime;
    renderTimes.current.push(renderTime);
    
    // Keep only last 60 measurements
    if (renderTimes.current.length > 60) {
      renderTimes.current.shift();
    }
    
    const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: avgRenderTime
    }));
  };

  // Quality adjustment based on performance
  const adjustQualityBasedOnPerformance = (fps: number) => {
    let newQuality: PerformanceMetrics['qualityLevel'] = 'high';
    
    if (fps < settings.targetFPS * 0.6) {
      newQuality = 'low';
    } else if (fps < settings.targetFPS * 0.8) {
      newQuality = 'medium';
    }
    
    setMetrics(prev => {
      if (prev.qualityLevel !== newQuality) {
        console.log(`Performance: Quality adjusted to ${newQuality} (FPS: ${fps})`);
        return { ...prev, qualityLevel: newQuality };
      }
      return prev;
    });
  };

  // Quality adjustment based on memory usage
  const adjustQualityBasedOnMemory = (memoryUsage: number) => {
    if (memoryUsage > settings.maxMemoryUsage * 1.2) {
      setMetrics(prev => {
        if (prev.qualityLevel !== 'low') {
          console.log(`Performance: Quality reduced due to memory pressure (${memoryUsage.toFixed(1)}MB)`);
          return { ...prev, qualityLevel: 'low' };
        }
        return prev;
      });
    }
  };

  // Start monitoring
  useEffect(() => {
    if (settings.enableMonitoring) {
      animationFrameId.current = requestAnimationFrame(measureFPS);
      
      // Memory monitoring interval
      const memoryInterval = setInterval(measureMemory, 5000);
      
      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        clearInterval(memoryInterval);
      };
    }
  }, [settings.enableMonitoring]);

  // Get quality settings based on current performance
  const getQualitySettings = () => {
    const baseSettings = {
      shadowMapSize: 2048,
      textureSize: 1024,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      enableLOD: false,
      lodDistance: 15,
      maxLODLevel: 3
    };

    switch (metrics.qualityLevel) {
      case 'low':
        return {
          ...baseSettings,
          shadowMapSize: 512,
          textureSize: 512,
          antialias: false,
          pixelRatio: 1,
          enableLOD: true,
          lodDistance: 8,
          maxLODLevel: 2
        };
      case 'medium':
        return {
          ...baseSettings,
          shadowMapSize: 1024,
          textureSize: 512,
          antialias: !capabilities.isMobile,
          pixelRatio: capabilities.isMobile ? 1 : 2,
          enableLOD: capabilities.isMobile,
          lodDistance: 12,
          maxLODLevel: 2
        };
      default:
        return baseSettings;
    }
  };

  // Performance warning system
  const getPerformanceWarnings = () => {
    const warnings: string[] = [];
    
    if (metrics.fps < settings.targetFPS * 0.7) {
      warnings.push('Low FPS detected - consider reducing quality settings');
    }
    
    if (metrics.memoryUsage > settings.maxMemoryUsage) {
      warnings.push('High memory usage - consider clearing unused assets');
    }
    
    if (metrics.frameDrops > 10) {
      warnings.push('Frequent frame drops detected - performance may be impacted');
    }
    
    return warnings;
  };

  return {
    metrics,
    measureRenderTime,
    getQualitySettings,
    getPerformanceWarnings,
    isPerformanceGood: metrics.fps >= settings.targetFPS * 0.8 && metrics.memoryUsage < settings.maxMemoryUsage
  };
}

// Default settings based on device capabilities
export function getDefaultPerformanceSettings(capabilities: ReturnType<typeof useDeviceCapabilities>): PerformanceSettings {
  return {
    targetFPS: capabilities.isMobile ? 30 : 60,
    maxMemoryUsage: capabilities.memoryLimit * 0.7, // Use 70% of available memory
    autoAdjustQuality: capabilities.isMobile || capabilities.connectionSpeed === 'slow',
    enableMonitoring: true
  };
}