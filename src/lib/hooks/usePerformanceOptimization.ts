'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';
import { performanceMonitor } from '@/lib/utils/performanceMonitor';
import { animationManager } from '@/lib/utils/animationManager';
import { threeJSMemoryManager } from '@/lib/utils/threeJSMemoryManager';
import { performanceAssetLoader } from '@/lib/utils/performanceAssetLoader';

interface PerformanceOptimizationConfig {
  targetFPS: number;
  memoryBudgetMB: number;
  autoQualityAdjustment: boolean;
  enableFPSMonitoring: boolean;
  enableMemoryTracking: boolean;
  enableAnimationOptimization: boolean;
  performanceReportingInterval: number;
}

interface PerformanceState {
  fps: number;
  memoryUsage: number;
  qualityLevel: 'high' | 'medium' | 'low';
  isOptimizing: boolean;
  warnings: string[];
  recommendations: string[];
}

interface QualitySettings {
  shadowMapSize: number;
  textureSize: number;
  antialias: boolean;
  pixelRatio: number;
  enableLOD: boolean;
  lodDistance: number;
  maxLODLevel: number;
  enableAnimations: boolean;
  enableParticles: boolean;
  enablePostProcessing: boolean;
  targetFPS: number;
}

export function usePerformanceOptimization(
  config: Partial<PerformanceOptimizationConfig> = {}
) {
  const capabilities = useDeviceCapabilities();
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    fps: 60,
    memoryUsage: 0,
    qualityLevel: 'high',
    isOptimizing: false,
    warnings: [],
    recommendations: []
  });

  const configRef = useRef<PerformanceOptimizationConfig>({
    targetFPS: capabilities.isMobile ? 30 : 60,
    memoryBudgetMB: capabilities.memoryLimit * 0.3 / 1024, // 30% of available memory
    autoQualityAdjustment: capabilities.isMobile || capabilities.connectionSpeed === 'slow',
    enableFPSMonitoring: true,
    enableMemoryTracking: true,
    enableAnimationOptimization: true,
    performanceReportingInterval: 5000,
    ...config
  });

  const performanceHistory = useRef<{
    fps: number[];
    memory: number[];
    timestamps: number[];
  }>({
    fps: [],
    memory: [],
    timestamps: []
  });

  // Initialize performance monitoring
  useEffect(() => {
    const conf = configRef.current;
    
    if (conf.enableFPSMonitoring) {
      performanceMonitor.startFPSMonitoring(conf.targetFPS);
    }

    // Set up animation manager with performance-aware settings
    if (conf.enableAnimationOptimization) {
      animationManager.updateConfig({
        targetFPS: conf.targetFPS,
        adaptiveFrameRate: conf.autoQualityAdjustment,
        performanceMonitoring: true,
        maxFrameSkip: capabilities.isMobile ? 3 : 5
      });
    }

    // Listen for quality adjustment events
    const handleQualityAdjust = (event: CustomEvent) => {
      const { level, metrics } = event.detail;
      setPerformanceState(prev => ({
        ...prev,
        qualityLevel: level,
        fps: metrics.fps || prev.fps,
        memoryUsage: metrics.memoryUsage || prev.memoryUsage
      }));
    };

    window.addEventListener('performance-quality-adjust', handleQualityAdjust as EventListener);

    return () => {
      performanceMonitor.stopFPSMonitoring();
      window.removeEventListener('performance-quality-adjust', handleQualityAdjust as EventListener);
    };
  }, [capabilities]);

  // Performance monitoring loop
  useEffect(() => {
    const interval = setInterval(() => {
      updatePerformanceMetrics();
    }, configRef.current.performanceReportingInterval);

    return () => clearInterval(interval);
  }, []);

  const updatePerformanceMetrics = useCallback(() => {
    const metrics = performanceMonitor.getMetrics();
    const memoryStats = threeJSMemoryManager.getMemoryStats();
    const animationMetrics = animationManager.getPerformanceMetrics();
    
    const currentFPS = metrics.fps || animationMetrics.averageFrameTime ? 
      1000 / animationMetrics.averageFrameTime : 60;
    const currentMemory = (memoryStats.usage.total / (1024 * 1024)) + 
      (metrics.memoryUsage ? metrics.memoryUsage / (1024 * 1024) : 0);

    // Update performance history
    const now = Date.now();
    performanceHistory.current.fps.push(currentFPS);
    performanceHistory.current.memory.push(currentMemory);
    performanceHistory.current.timestamps.push(now);

    // Keep only last 60 measurements (5 minutes at 5-second intervals)
    if (performanceHistory.current.fps.length > 60) {
      performanceHistory.current.fps.shift();
      performanceHistory.current.memory.shift();
      performanceHistory.current.timestamps.shift();
    }

    // Generate warnings and recommendations
    const warnings = generateWarnings(currentFPS, currentMemory, metrics);
    const recommendations = generateRecommendations(currentFPS, currentMemory, capabilities);

    setPerformanceState(prev => ({
      ...prev,
      fps: currentFPS,
      memoryUsage: currentMemory,
      warnings,
      recommendations
    }));

    // Auto quality adjustment
    if (configRef.current.autoQualityAdjustment) {
      performAutoQualityAdjustment(currentFPS, currentMemory);
    }
  }, [capabilities]);

  const generateWarnings = (fps: number, memory: number, metrics: any): string[] => {
    const warnings: string[] = [];
    const targetFPS = configRef.current.targetFPS;

    if (fps < targetFPS * 0.7) {
      warnings.push(`Low FPS detected (${fps.toFixed(1)}/${targetFPS}). Consider reducing quality.`);
    }

    if (memory > configRef.current.memoryBudgetMB * 0.8) {
      warnings.push(`High memory usage (${memory.toFixed(1)}MB). Memory cleanup recommended.`);
    }

    if (metrics.threeJSMemory?.textures > 50) {
      warnings.push(`High texture count (${metrics.threeJSMemory.textures}). Consider texture optimization.`);
    }

    if (metrics.frameDrops && metrics.frameDrops > 10) {
      warnings.push(`Frequent frame drops detected (${metrics.frameDrops}). Performance optimization needed.`);
    }

    return warnings;
  };

  const generateRecommendations = (fps: number, memory: number, caps: typeof capabilities): string[] => {
    const recommendations: string[] = [];
    const targetFPS = configRef.current.targetFPS;

    if (fps < targetFPS * 0.8) {
      recommendations.push('Enable Level of Detail (LOD) system');
      recommendations.push('Reduce shadow map resolution');
      recommendations.push('Disable anti-aliasing');
      
      if (caps.isMobile) {
        recommendations.push('Switch to mobile-optimized materials');
      }
    }

    if (memory > configRef.current.memoryBudgetMB * 0.7) {
      recommendations.push('Reduce texture resolution');
      recommendations.push('Enable texture compression');
      recommendations.push('Implement asset streaming');
    }

    if (caps.connectionSpeed === 'slow') {
      recommendations.push('Enable progressive asset loading');
      recommendations.push('Use lower quality asset variants');
    }

    return recommendations;
  };

  const performAutoQualityAdjustment = useCallback((fps: number, memory: number) => {
    const targetFPS = configRef.current.targetFPS;
    const memoryBudget = configRef.current.memoryBudgetMB;
    
    let newQualityLevel: PerformanceState['qualityLevel'] = performanceState.qualityLevel;

    // Determine quality level based on performance
    if (fps < targetFPS * 0.6 || memory > memoryBudget * 0.9) {
      newQualityLevel = 'low';
    } else if (fps < targetFPS * 0.8 || memory > memoryBudget * 0.7) {
      newQualityLevel = 'medium';
    } else if (fps > targetFPS * 0.95 && memory < memoryBudget * 0.5) {
      newQualityLevel = 'high';
    }

    // Only update if quality level changed
    if (newQualityLevel !== performanceState.qualityLevel) {
      setPerformanceState(prev => ({ ...prev, qualityLevel: newQualityLevel }));
      
      // Apply quality settings
      applyQualitySettings(newQualityLevel);
      
      console.log(`Auto quality adjustment: ${performanceState.qualityLevel} → ${newQualityLevel}`);
    }
  }, [performanceState.qualityLevel]);

  const applyQualitySettings = useCallback((qualityLevel: PerformanceState['qualityLevel']) => {
    const settings = getQualitySettings(qualityLevel);
    
    // Update animation manager settings
    animationManager.updateConfig({
      targetFPS: settings.targetFPS,
      adaptiveFrameRate: qualityLevel !== 'high'
    });

    // Optimize animations based on quality
    if (qualityLevel === 'low') {
      animationManager.optimizeForPerformance();
    } else {
      animationManager.restoreAllLoops();
    }

    // Trigger memory optimization if needed
    if (qualityLevel === 'low') {
      threeJSMemoryManager.optimizeMemory();
    }
  }, []);

  const getQualitySettings = useCallback((qualityLevel: PerformanceState['qualityLevel']): QualitySettings => {
    const baseSettings: QualitySettings = {
      shadowMapSize: 2048,
      textureSize: 1024,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      enableLOD: false,
      lodDistance: 15,
      maxLODLevel: 3,
      enableAnimations: true,
      enableParticles: true,
      enablePostProcessing: true,
      targetFPS: configRef.current.targetFPS
    };

    switch (qualityLevel) {
      case 'low':
        return {
          ...baseSettings,
          shadowMapSize: 512,
          textureSize: 256,
          antialias: false,
          pixelRatio: 1,
          enableLOD: true,
          lodDistance: 8,
          maxLODLevel: 2,
          enableAnimations: false,
          enableParticles: false,
          enablePostProcessing: false,
          targetFPS: Math.min(30, configRef.current.targetFPS)
        };
      
      case 'medium':
        return {
          ...baseSettings,
          shadowMapSize: 1024,
          textureSize: 512,
          antialias: !capabilities.isMobile,
          pixelRatio: capabilities.isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2),
          enableLOD: true,
          lodDistance: 12,
          maxLODLevel: 2,
          enableParticles: false,
          enablePostProcessing: false,
          targetFPS: capabilities.isMobile ? 30 : configRef.current.targetFPS
        };
      
      default:
        return baseSettings;
    }
  }, [capabilities]);

  // Manual optimization controls
  const optimizePerformance = useCallback(() => {
    setPerformanceState(prev => ({ ...prev, isOptimizing: true }));
    
    // Perform comprehensive optimization
    threeJSMemoryManager.optimizeMemory();
    animationManager.optimizeForPerformance();
    performanceAssetLoader.cleanup();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    setTimeout(() => {
      setPerformanceState(prev => ({ ...prev, isOptimizing: false }));
    }, 1000);
  }, []);

  const setQualityLevel = useCallback((level: PerformanceState['qualityLevel']) => {
    setPerformanceState(prev => ({ ...prev, qualityLevel: level }));
    applyQualitySettings(level);
  }, [applyQualitySettings]);

  // Performance analytics
  const getPerformanceAnalytics = useCallback(() => {
    const history = performanceHistory.current;
    
    if (history.fps.length === 0) {
      return null;
    }

    const avgFPS = history.fps.reduce((a, b) => a + b, 0) / history.fps.length;
    const minFPS = Math.min(...history.fps);
    const maxFPS = Math.max(...history.fps);
    
    const avgMemory = history.memory.reduce((a, b) => a + b, 0) / history.memory.length;
    const maxMemory = Math.max(...history.memory);
    
    return {
      fps: { average: avgFPS, min: minFPS, max: maxFPS },
      memory: { average: avgMemory, max: maxMemory },
      qualityLevel: performanceState.qualityLevel,
      deviceCapabilities: capabilities,
      recommendations: performanceState.recommendations
    };
  }, [performanceState, capabilities]);

  // Cleanup
  useEffect(() => {
    return () => {
      performanceMonitor.performCleanup();
      animationManager.cleanup();
      threeJSMemoryManager.cleanup();
    };
  }, []);

  return {
    performanceState,
    qualitySettings: getQualitySettings(performanceState.qualityLevel),
    optimizePerformance,
    setQualityLevel,
    getPerformanceAnalytics,
    capabilities
  };
}