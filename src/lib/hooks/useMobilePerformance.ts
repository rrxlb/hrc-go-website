'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  batteryLevel?: number;
  connectionType?: string;
  isLowPowerMode?: boolean;
  shouldReduceQuality: boolean;
}

export function useMobilePerformance() {
  const capabilities = useDeviceCapabilities();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    shouldReduceQuality: false
  });

  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high');

  // FPS monitoring
  const measureFPS = useCallback(() => {
    let frames = 0;
    let lastTime = performance.now();
    
    const countFrame = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrame);
    };
    
    requestAnimationFrame(countFrame);
  }, []);

  // Memory monitoring
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Battery monitoring
  const measureBattery = useCallback(async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setMetrics(prev => ({ 
          ...prev, 
          batteryLevel: battery.level,
          isLowPowerMode: battery.level < 0.2
        }));
      } catch (error) {
        // Battery API not supported or permission denied
      }
    }
  }, []);

  // Connection monitoring
  const measureConnection = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setMetrics(prev => ({ 
        ...prev, 
        connectionType: connection.effectiveType 
      }));
    }
  }, []);

  // Determine if quality should be reduced
  const shouldReduceQuality = useCallback((currentMetrics: PerformanceMetrics) => {
    const conditions = [
      currentMetrics.fps < 30, // Low FPS
      currentMetrics.memoryUsage > 0.8, // High memory usage
      currentMetrics.batteryLevel !== undefined && currentMetrics.batteryLevel < 0.2, // Low battery
      currentMetrics.connectionType === 'slow-2g' || currentMetrics.connectionType === '2g', // Slow connection
      capabilities.isMobile && capabilities.memoryLimit < 1024, // Low-end mobile device
    ];

    return conditions.filter(Boolean).length >= 2; // Reduce quality if 2+ conditions are met
  }, [capabilities]);

  // Update performance level based on metrics
  useEffect(() => {
    const reduce = shouldReduceQuality(metrics);
    setMetrics(prev => ({ ...prev, shouldReduceQuality: reduce }));

    // Determine overall performance level
    if (reduce || metrics.fps < 30) {
      setPerformanceLevel('low');
    } else if (metrics.fps < 45 || metrics.memoryUsage > 0.6) {
      setPerformanceLevel('medium');
    } else {
      setPerformanceLevel('high');
    }
  }, [metrics.fps, metrics.memoryUsage, metrics.batteryLevel, metrics.connectionType, shouldReduceQuality]);

  // Initialize monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    measureFPS();
    measureBattery();
    measureConnection();

    // Set up periodic monitoring
    const memoryInterval = setInterval(measureMemory, 5000);
    const batteryInterval = setInterval(measureBattery, 30000);
    const connectionInterval = setInterval(measureConnection, 10000);

    return () => {
      clearInterval(memoryInterval);
      clearInterval(batteryInterval);
      clearInterval(connectionInterval);
    };
  }, [measureFPS, measureMemory, measureBattery, measureConnection]);

  // Get optimized settings based on performance
  const getOptimizedSettings = useCallback(() => {
    const baseSettings = {
      shadowMapSize: 2048,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      textureSize: 1024,
      enableLOD: false,
      targetFPS: 60,
      enableAnimations: true,
      enableParticles: true,
      enablePostProcessing: true
    };

    switch (performanceLevel) {
      case 'low':
        return {
          ...baseSettings,
          shadowMapSize: 512,
          antialias: false,
          pixelRatio: 1,
          textureSize: 512,
          enableLOD: true,
          targetFPS: 30,
          enableAnimations: false,
          enableParticles: false,
          enablePostProcessing: false
        };
      
      case 'medium':
        return {
          ...baseSettings,
          shadowMapSize: 1024,
          antialias: !capabilities.isMobile,
          pixelRatio: capabilities.isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2),
          textureSize: 512,
          enableLOD: true,
          targetFPS: 45,
          enableParticles: false,
          enablePostProcessing: false
        };
      
      default:
        return baseSettings;
    }
  }, [performanceLevel, capabilities.isMobile]);

  // Manual quality adjustment
  const adjustQuality = useCallback((level: 'high' | 'medium' | 'low') => {
    setPerformanceLevel(level);
  }, []);

  // Performance warning system
  const getPerformanceWarning = useCallback(() => {
    if (metrics.fps < 20) {
      return {
        level: 'critical',
        message: 'Very low frame rate detected. Consider reducing graphics quality.',
        action: 'reduce_quality'
      };
    }
    
    if (metrics.memoryUsage > 0.9) {
      return {
        level: 'warning',
        message: 'High memory usage detected. Some features may be disabled.',
        action: 'reduce_memory'
      };
    }
    
    if (metrics.batteryLevel !== undefined && metrics.batteryLevel < 0.1) {
      return {
        level: 'info',
        message: 'Low battery detected. Enabling power saving mode.',
        action: 'power_save'
      };
    }
    
    return null;
  }, [metrics]);

  return {
    metrics,
    performanceLevel,
    optimizedSettings: getOptimizedSettings(),
    adjustQuality,
    warning: getPerformanceWarning(),
    capabilities
  };
}

// Hook for automatic quality adjustment
export function useAutoQualityAdjustment() {
  const { metrics, performanceLevel, adjustQuality } = useMobilePerformance();
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(true);

  useEffect(() => {
    if (!autoAdjustEnabled) return;

    // Auto-adjust based on sustained poor performance
    const checkPerformance = () => {
      if (metrics.fps < 25 && performanceLevel !== 'low') {
        adjustQuality('low');
      } else if (metrics.fps < 40 && performanceLevel === 'high') {
        adjustQuality('medium');
      } else if (metrics.fps > 55 && performanceLevel === 'low') {
        adjustQuality('medium');
      } else if (metrics.fps > 58 && performanceLevel === 'medium') {
        adjustQuality('high');
      }
    };

    const interval = setInterval(checkPerformance, 3000);
    return () => clearInterval(interval);
  }, [metrics.fps, performanceLevel, adjustQuality, autoAdjustEnabled]);

  return {
    autoAdjustEnabled,
    setAutoAdjustEnabled,
    currentLevel: performanceLevel
  };
}