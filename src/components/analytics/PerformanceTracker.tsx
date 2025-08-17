/**
 * Component for tracking 3D performance metrics
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerformanceAnalytics } from '@/lib/hooks/usePerformanceAnalytics';

interface PerformanceTrackerProps {
  trackingInterval?: number; // milliseconds
  enableMemoryTracking?: boolean;
  enableSceneComplexityTracking?: boolean;
}

export function PerformanceTracker({
  trackingInterval = 5000, // 5 seconds
  enableMemoryTracking = true,
  enableSceneComplexityTracking = true
}: PerformanceTrackerProps) {
  const { scene, gl } = useThree();
  const performanceAnalytics = usePerformanceAnalytics();
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const lastTrackingTime = useRef(performance.now());
  const animationStartTimes = useRef<Map<string, number>>(new Map());

  // Track FPS and performance metrics
  useFrame(() => {
    const now = performance.now();
    frameCount.current++;
    
    // Calculate FPS every second
    const deltaTime = now - lastTime.current;
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / deltaTime);
      performanceAnalytics.trackFPS(fps);
      
      frameCount.current = 0;
      lastTime.current = now;
    }

    // Periodic comprehensive tracking
    const timeSinceLastTracking = now - lastTrackingTime.current;
    if (timeSinceLastTracking >= trackingInterval) {
      // Track memory usage
      if (enableMemoryTracking && 'memory' in performance) {
        const memoryInfo = (performance as any).memory;
        const memoryMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
        performanceAnalytics.trackMemoryUsage(memoryMB);
      }

      // Track scene complexity
      if (enableSceneComplexityTracking) {
        const complexity = analyzeSceneComplexity(scene);
        performanceAnalytics.trackSceneComplexity(complexity);
      }

      lastTrackingTime.current = now;
    }
  });

  // Analyze scene complexity
  const analyzeSceneComplexity = (scene: THREE.Scene) => {
    let triangleCount = 0;
    let textureCount = 0;
    let lightCount = 0;

    scene.traverse((object) => {
      // Count triangles
      if (object instanceof THREE.Mesh && object.geometry) {
        const geometry = object.geometry;
        if (geometry.index) {
          triangleCount += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          triangleCount += geometry.attributes.position.count / 3;
        }
      }

      // Count lights
      if (object instanceof THREE.Light) {
        lightCount++;
      }

      // Count textures
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            if (material.map) textureCount++;
            if (material.normalMap) textureCount++;
            if (material.roughnessMap) textureCount++;
            if (material.metalnessMap) textureCount++;
          } else if (material instanceof THREE.MeshBasicMaterial) {
            if (material.map) textureCount++;
          }
        });
      }
    });

    return {
      triangleCount: Math.round(triangleCount),
      textureCount,
      lightCount
    };
  };

  // Track animation performance
  const trackAnimationStart = (animationName: string) => {
    animationStartTimes.current.set(animationName, performance.now());
  };

  const trackAnimationEnd = (animationName: string, frameDrops: number = 0) => {
    const startTime = animationStartTimes.current.get(animationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      performanceAnalytics.trackAnimationPerformance(animationName, duration, frameDrops);
      animationStartTimes.current.delete(animationName);
    }
  };

  // Initialize performance monitoring
  useEffect(() => {
    const cleanup = performanceAnalytics.startPerformanceMonitoring();
    
    // Track initial load time
    if (typeof window !== 'undefined') {
      const loadTime = performance.now();
      performanceAnalytics.trackLoadTime(loadTime, '3d_scene');
    }

    return cleanup;
  }, [performanceAnalytics]);

  // Expose tracking functions to parent components via ref
  useEffect(() => {
    // Make tracking functions available globally for other components
    (window as any).__performanceTracker = {
      trackAnimationStart,
      trackAnimationEnd,
      trackLoadTime: performanceAnalytics.trackLoadTime
    };

    return () => {
      delete (window as any).__performanceTracker;
    };
  }, [performanceAnalytics]);

  // This component doesn't render anything visible
  return null;
}

// Helper hook for components to track their own animations
export function useAnimationTracking() {
  const trackAnimationStart = (animationName: string) => {
    if (typeof window !== 'undefined' && (window as any).__performanceTracker) {
      (window as any).__performanceTracker.trackAnimationStart(animationName);
    }
  };

  const trackAnimationEnd = (animationName: string, frameDrops: number = 0) => {
    if (typeof window !== 'undefined' && (window as any).__performanceTracker) {
      (window as any).__performanceTracker.trackAnimationEnd(animationName, frameDrops);
    }
  };

  const trackLoadTime = (loadTimeMs: number, assetType: string) => {
    if (typeof window !== 'undefined' && (window as any).__performanceTracker) {
      (window as any).__performanceTracker.trackLoadTime(loadTimeMs, assetType);
    }
  };

  return {
    trackAnimationStart,
    trackAnimationEnd,
    trackLoadTime
  };
}