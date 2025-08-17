'use client';

import { useState, useEffect } from 'react';
import { usePerformanceOptimization } from '@/lib/hooks/usePerformanceOptimization';
import { threeJSMemoryManager } from '@/lib/utils/threeJSMemoryManager';
import { animationManager } from '@/lib/utils/animationManager';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

export default function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right',
  compact = false
}: PerformanceMonitorProps) {
  const { performanceState, qualitySettings, optimizePerformance, setQualityLevel } = usePerformanceOptimization();
  const [memoryStats, setMemoryStats] = useState(threeJSMemoryManager.getMemoryStats());
  const [animationStats, setAnimationStats] = useState(animationManager.getPerformanceMetrics());
  const [isExpanded, setIsExpanded] = useState(!compact);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setMemoryStats(threeJSMemoryManager.getMemoryStats());
      setAnimationStats(animationManager.getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (utilization: number) => {
    if (utilization < 0.7) return 'text-green-400';
    if (utilization < 0.9) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-auto`}>
      <div className="bg-black/80 backdrop-blur-sm text-white text-xs font-mono rounded-lg border border-gray-600 shadow-lg">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={getFPSColor(performanceState.fps)}>
              {performanceState.fps.toFixed(0)} FPS
            </span>
            <span className="text-gray-400">
              {isExpanded ? '−' : '+'}
            </span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-600">
            {/* Performance Metrics */}
            <div className="p-2 space-y-1">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className={getFPSColor(performanceState.fps)}>
                  {performanceState.fps.toFixed(1)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className={getMemoryColor(memoryStats.utilization.total)}>
                  {formatBytes(memoryStats.usage.total)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Quality:</span>
                <span className={
                  performanceState.qualityLevel === 'high' ? 'text-green-400' :
                  performanceState.qualityLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                }>
                  {performanceState.qualityLevel.toUpperCase()}
                </span>
              </div>
              
              {animationStats.totalFrames > 0 && (
                <div className="flex justify-between">
                  <span>Avg Frame:</span>
                  <span>{animationStats.averageFrameTime.toFixed(1)}ms</span>
                </div>
              )}
            </div>

            {/* Three.js Memory Details */}
            {memoryStats.trackedObjects > 0 && (
              <div className="border-t border-gray-600 p-2 space-y-1">
                <div className="text-gray-300 font-semibold">Three.js Memory</div>
                <div className="flex justify-between">
                  <span>Geometries:</span>
                  <span>{formatBytes(memoryStats.usage.geometries)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Textures:</span>
                  <span>{formatBytes(memoryStats.usage.textures)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Objects:</span>
                  <span>{memoryStats.trackedObjects}</span>
                </div>
                <div className="flex justify-between">
                  <span>Utilization:</span>
                  <span className={getMemoryColor(memoryStats.utilization.total)}>
                    {formatPercentage(memoryStats.utilization.total)}
                  </span>
                </div>
              </div>
            )}

            {/* Quality Settings */}
            <div className="border-t border-gray-600 p-2 space-y-1">
              <div className="text-gray-300 font-semibold">Quality Settings</div>
              <div className="flex justify-between">
                <span>Shadows:</span>
                <span>{qualitySettings.shadowMapSize}px</span>
              </div>
              <div className="flex justify-between">
                <span>Textures:</span>
                <span>{qualitySettings.textureSize}px</span>
              </div>
              <div className="flex justify-between">
                <span>LOD:</span>
                <span>{qualitySettings.enableLOD ? 'ON' : 'OFF'}</span>
              </div>
              <div className="flex justify-between">
                <span>Antialias:</span>
                <span>{qualitySettings.antialias ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            {/* Warnings */}
            {performanceState.warnings.length > 0 && (
              <div className="border-t border-gray-600 p-2">
                <div className="text-red-400 font-semibold mb-1">Warnings</div>
                {performanceState.warnings.map((warning, index) => (
                  <div key={index} className="text-red-300 text-xs">
                    • {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="border-t border-gray-600 p-2 space-y-2">
              <div className="flex gap-1">
                <button
                  onClick={() => setQualityLevel('high')}
                  className={`px-2 py-1 text-xs rounded ${
                    performanceState.qualityLevel === 'high'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  High
                </button>
                <button
                  onClick={() => setQualityLevel('medium')}
                  className={`px-2 py-1 text-xs rounded ${
                    performanceState.qualityLevel === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Med
                </button>
                <button
                  onClick={() => setQualityLevel('low')}
                  className={`px-2 py-1 text-xs rounded ${
                    performanceState.qualityLevel === 'low'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Low
                </button>
              </div>
              
              <button
                onClick={optimizePerformance}
                disabled={performanceState.isOptimizing}
                className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {performanceState.isOptimizing ? 'Optimizing...' : 'Optimize'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for production use
export function CompactPerformanceMonitor() {
  const { performanceState } = usePerformanceOptimization();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="bg-black/60 text-white text-xs font-mono px-2 py-1 rounded">
        <span className={
          performanceState.fps >= 55 ? 'text-green-400' :
          performanceState.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
        }>
          {performanceState.fps.toFixed(0)} FPS
        </span>
        <span className="text-gray-400 mx-1">|</span>
        <span className={
          performanceState.memoryUsage < 50 ? 'text-green-400' :
          performanceState.memoryUsage < 100 ? 'text-yellow-400' : 'text-red-400'
        }>
          {performanceState.memoryUsage.toFixed(0)}MB
        </span>
      </div>
    </div>
  );
}