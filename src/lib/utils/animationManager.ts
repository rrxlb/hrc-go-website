'use client';

import { performanceMonitor } from './performanceMonitor';
import { useEffect, useCallback, useState } from 'react';

interface AnimationLoop {
  id: string;
  callback: (deltaTime: number, elapsedTime: number) => void;
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  targetFPS?: number;
  lastFrameTime: number;
  frameSkipCount: number;
}

interface AnimationManagerConfig {
  targetFPS: number;
  adaptiveFrameRate: boolean;
  performanceMonitoring: boolean;
  maxFrameSkip: number;
}

class AnimationManager {
  private loops: Map<string, AnimationLoop> = new Map();
  private isRunning: boolean = false;
  private animationFrameId?: number;
  private lastTime: number = 0;
  private config: AnimationManagerConfig;
  private performanceMetrics = {
    frameTime: 0,
    skippedFrames: 0,
    totalFrames: 0,
    averageFrameTime: 0
  };
  private frameTimeHistory: number[] = [];
  private cleanupCallbacks: (() => void)[] = [];

  constructor(config: Partial<AnimationManagerConfig> = {}) {
    this.config = {
      targetFPS: 60,
      adaptiveFrameRate: true,
      performanceMonitoring: true,
      maxFrameSkip: 5,
      ...config
    };
  }

  addLoop(
    id: string,
    callback: AnimationLoop['callback'],
    priority: AnimationLoop['priority'] = 'medium',
    targetFPS?: number
  ): void {
    if (this.loops.has(id)) {
      console.warn(`Animation loop ${id} already exists. Updating existing loop.`);
    }

    this.loops.set(id, {
      id,
      callback,
      priority,
      enabled: true,
      targetFPS,
      lastFrameTime: 0,
      frameSkipCount: 0
    });

    // Start the animation manager if not already running
    if (!this.isRunning) {
      this.start();
    }
  }

  removeLoop(id: string): boolean {
    const removed = this.loops.delete(id);
    
    // Stop the animation manager if no loops remain
    if (this.loops.size === 0 && this.isRunning) {
      this.stop();
    }
    
    return removed;
  }

  enableLoop(id: string): void {
    const loop = this.loops.get(id);
    if (loop) {
      loop.enabled = true;
    }
  }

  disableLoop(id: string): void {
    const loop = this.loops.get(id);
    if (loop) {
      loop.enabled = false;
    }
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    
    if (this.config.performanceMonitoring) {
      performanceMonitor.startFPSMonitoring(this.config.targetFPS);
    }
    
    this.tick();
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    
    if (this.config.performanceMonitoring) {
      performanceMonitor.stopFPSMonitoring();
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    const targetFrameTime = 1000 / this.config.targetFPS;
    
    // Performance monitoring
    if (this.config.performanceMonitoring) {
      const renderStart = performanceMonitor.startRenderMeasurement();
      this.executeLoops(deltaTime, currentTime);
      performanceMonitor.endRenderMeasurement(renderStart);
    } else {
      this.executeLoops(deltaTime, currentTime);
    }
    
    // Update performance metrics
    this.updatePerformanceMetrics(deltaTime);
    
    // Adaptive frame rate adjustment
    if (this.config.adaptiveFrameRate) {
      this.adjustFrameRate(deltaTime);
    }
    
    this.lastTime = currentTime;
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private executeLoops(deltaTime: number, currentTime: number): void {
    // Sort loops by priority
    const sortedLoops = Array.from(this.loops.values()).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    for (const loop of sortedLoops) {
      if (!loop.enabled) continue;
      
      // Check if this loop should run based on its target FPS
      if (loop.targetFPS) {
        const targetFrameTime = 1000 / loop.targetFPS;
        if (currentTime - loop.lastFrameTime < targetFrameTime) {
          continue;
        }
        loop.lastFrameTime = currentTime;
      }
      
      // Frame skipping for performance
      if (this.shouldSkipFrame(loop, deltaTime)) {
        loop.frameSkipCount++;
        continue;
      }
      
      try {
        loop.callback(deltaTime, currentTime);
        loop.frameSkipCount = 0; // Reset skip count on successful execution
      } catch (error) {
        console.error(`Animation loop ${loop.id} threw an error:`, error);
        // Disable problematic loops to prevent cascading failures
        loop.enabled = false;
      }
    }
  }

  private shouldSkipFrame(loop: AnimationLoop, deltaTime: number): boolean {
    // Skip frames if performance is poor and we haven't exceeded max skip count
    const isPerformancePoor = deltaTime > (1000 / this.config.targetFPS) * 1.5;
    const canSkipFrame = loop.frameSkipCount < this.config.maxFrameSkip;
    const isLowPriority = loop.priority === 'low';
    
    return isPerformancePoor && canSkipFrame && isLowPriority;
  }

  private updatePerformanceMetrics(deltaTime: number): void {
    this.performanceMetrics.frameTime = deltaTime;
    this.performanceMetrics.totalFrames++;
    
    // Track frame time history for averaging
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }
    
    this.performanceMetrics.averageFrameTime = 
      this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    
    // Count skipped frames
    const skippedThisFrame = Array.from(this.loops.values())
      .filter(loop => loop.frameSkipCount > 0).length;
    this.performanceMetrics.skippedFrames += skippedThisFrame;
  }

  private adjustFrameRate(deltaTime: number): void {
    const targetFrameTime = 1000 / this.config.targetFPS;
    
    // If consistently running slow, reduce target FPS
    if (this.performanceMetrics.averageFrameTime > targetFrameTime * 1.5) {
      if (this.config.targetFPS > 30) {
        this.config.targetFPS = Math.max(30, this.config.targetFPS - 5);
        console.log(`Adaptive FPS: Reduced target FPS to ${this.config.targetFPS}`);
      }
    }
    
    // If running well, try to increase FPS back up
    else if (this.performanceMetrics.averageFrameTime < targetFrameTime * 0.8) {
      if (this.config.targetFPS < 60) {
        this.config.targetFPS = Math.min(60, this.config.targetFPS + 5);
        console.log(`Adaptive FPS: Increased target FPS to ${this.config.targetFPS}`);
      }
    }
  }

  // Cleanup management
  addCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  cleanup(): void {
    // Stop all animations
    this.stop();
    
    // Clear all loops
    this.loops.clear();
    
    // Execute cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Animation cleanup callback failed:', error);
      }
    });
    
    this.cleanupCallbacks = [];
    
    // Reset metrics
    this.performanceMetrics = {
      frameTime: 0,
      skippedFrames: 0,
      totalFrames: 0,
      averageFrameTime: 0
    };
    
    this.frameTimeHistory = [];
  }

  // Getters for monitoring
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  getActiveLoops(): string[] {
    return Array.from(this.loops.keys()).filter(id => {
      const loop = this.loops.get(id);
      return loop?.enabled;
    });
  }

  getConfig(): AnimationManagerConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AnimationManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Pause/Resume functionality
  pauseAll(): void {
    this.loops.forEach(loop => {
      loop.enabled = false;
    });
  }

  resumeAll(): void {
    this.loops.forEach(loop => {
      loop.enabled = true;
    });
  }

  // Performance-based loop management
  optimizeForPerformance(): void {
    const avgFrameTime = this.performanceMetrics.averageFrameTime;
    const targetFrameTime = 1000 / this.config.targetFPS;
    
    if (avgFrameTime > targetFrameTime * 1.5) {
      // Disable low priority loops
      this.loops.forEach(loop => {
        if (loop.priority === 'low') {
          loop.enabled = false;
        }
      });
      
      console.log('Performance optimization: Disabled low priority animations');
    }
  }

  restoreAllLoops(): void {
    this.loops.forEach(loop => {
      loop.enabled = true;
    });
  }
}

// Singleton instance
export const animationManager = new AnimationManager();

// React hook for using animation loops with automatic cleanup
export function useAnimationLoop(
  id: string,
  callback: (deltaTime: number, elapsedTime: number) => void,
  priority: 'high' | 'medium' | 'low' = 'medium',
  targetFPS?: number,
  dependencies: any[] = []
) {

  
  const memoizedCallback = useCallback(callback, dependencies);
  
  useEffect(() => {
    animationManager.addLoop(id, memoizedCallback, priority, targetFPS);
    
    return () => {
      animationManager.removeLoop(id);
    };
  }, [id, memoizedCallback, priority, targetFPS]);
  
  return {
    enable: () => animationManager.enableLoop(id),
    disable: () => animationManager.disableLoop(id),
    remove: () => animationManager.removeLoop(id)
  };
}

// Performance monitoring hook
export function useAnimationPerformance() {

  
  const [metrics, setMetrics] = useState(animationManager.getPerformanceMetrics());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(animationManager.getPerformanceMetrics());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return metrics;
}