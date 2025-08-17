'use client';

import { performanceMonitor } from './performanceMonitor';

interface AssetLoadingStrategy {
  priority: 'critical' | 'high' | 'medium' | 'low';
  loadCondition: () => boolean;
  fallbackAsset?: string;
  maxRetries: number;
  timeout: number;
}

interface NetworkAwareAsset {
  id: string;
  url: string;
  type: 'texture' | 'model' | 'audio' | 'font';
  size: number; // in bytes
  strategy: AssetLoadingStrategy;
  alternatives?: {
    slow: string; // Low quality version for slow connections
    medium: string; // Medium quality version
    fast: string; // High quality version
  };
}

interface LoadingProgress {
  loaded: number;
  total: number;
  currentAsset?: string;
  bytesLoaded: number;
  bytesTotal: number;
  estimatedTimeRemaining: number;
}

class PerformanceAssetLoader {
  private loadingQueue: NetworkAwareAsset[] = [];
  private loadedAssets: Map<string, any> = new Map();
  private failedAssets: Set<string> = new Set();
  private loadingProgress: LoadingProgress = {
    loaded: 0,
    total: 0,
    bytesLoaded: 0,
    bytesTotal: 0,
    estimatedTimeRemaining: 0
  };
  private connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';
  private memoryBudget: number = 100 * 1024 * 1024; // 100MB default
  private currentMemoryUsage: number = 0;
  private loadStartTime: number = 0;
  private progressCallbacks: ((progress: LoadingProgress) => void)[] = [];

  constructor() {
    this.detectConnectionSpeed();
    this.estimateMemoryBudget();
  }

  private detectConnectionSpeed() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType;
      const downlink = connection?.downlink || 0;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
        this.connectionSpeed = 'slow';
      } else if (effectiveType === '4g' || downlink > 10) {
        this.connectionSpeed = 'fast';
      } else {
        this.connectionSpeed = 'medium';
      }
    }
  }

  private estimateMemoryBudget() {
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory;
      this.memoryBudget = Math.min(deviceMemory * 1024 * 1024 * 0.3, 200 * 1024 * 1024); // 30% of device memory, max 200MB
    } else {
      // Estimate based on user agent
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      this.memoryBudget = isMobile ? 50 * 1024 * 1024 : 100 * 1024 * 1024; // 50MB mobile, 100MB desktop
    }
  }

  addAsset(asset: NetworkAwareAsset) {
    this.loadingQueue.push(asset);
    this.loadingProgress.total++;
    this.loadingProgress.bytesTotal += asset.size;
  }

  addProgressCallback(callback: (progress: LoadingProgress) => void) {
    this.progressCallbacks.push(callback);
  }

  private notifyProgress() {
    this.progressCallbacks.forEach(callback => callback({ ...this.loadingProgress }));
  }

  private selectAssetVariant(asset: NetworkAwareAsset): string {
    if (!asset.alternatives) return asset.url;
    
    switch (this.connectionSpeed) {
      case 'slow':
        return asset.alternatives.slow || asset.url;
      case 'fast':
        return asset.alternatives.fast || asset.url;
      default:
        return asset.alternatives.medium || asset.url;
    }
  }

  private shouldLoadAsset(asset: NetworkAwareAsset): boolean {
    // Check memory budget
    if (this.currentMemoryUsage + asset.size > this.memoryBudget) {
      console.warn(`Skipping asset ${asset.id} due to memory budget constraints`);
      return false;
    }
    
    // Check loading condition
    if (!asset.strategy.loadCondition()) {
      return false;
    }
    
    // Check if already failed too many times
    if (this.failedAssets.has(asset.id)) {
      return false;
    }
    
    return true;
  }

  private async loadSingleAsset(asset: NetworkAwareAsset): Promise<any> {
    if (!this.shouldLoadAsset(asset)) {
      throw new Error(`Asset ${asset.id} skipped due to loading conditions`);
    }
    
    const url = this.selectAssetVariant(asset);
    let retries = 0;
    
    while (retries < asset.strategy.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), asset.strategy.timeout);
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'max-age=31536000', // Cache for 1 year
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        this.currentMemoryUsage += blob.size;
        
        // Create appropriate object based on asset type
        let loadedAsset: any;
        switch (asset.type) {
          case 'texture':
            loadedAsset = await this.createTextureFromBlob(blob);
            break;
          case 'model':
            loadedAsset = await this.createModelFromBlob(blob);
            break;
          case 'audio':
            loadedAsset = await this.createAudioFromBlob(blob);
            break;
          default:
            loadedAsset = blob;
        }
        
        this.loadedAssets.set(asset.id, loadedAsset);
        return loadedAsset;
        
      } catch (error) {
        retries++;
        console.warn(`Failed to load asset ${asset.id} (attempt ${retries}):`, error);
        
        if (retries >= asset.strategy.maxRetries) {
          this.failedAssets.add(asset.id);
          
          // Try fallback asset if available
          if (asset.strategy.fallbackAsset) {
            try {
              const fallbackResponse = await fetch(asset.strategy.fallbackAsset);
              const fallbackBlob = await fallbackResponse.blob();
              const fallbackAsset = await this.createTextureFromBlob(fallbackBlob);
              this.loadedAssets.set(asset.id, fallbackAsset);
              return fallbackAsset;
            } catch (fallbackError) {
              console.error(`Fallback asset also failed for ${asset.id}:`, fallbackError);
            }
          }
          
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }

  private async createTextureFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  private async createModelFromBlob(blob: Blob): Promise<ArrayBuffer> {
    return blob.arrayBuffer();
  }

  private async createAudioFromBlob(blob: Blob): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
      audio.src = URL.createObjectURL(blob);
    });
  }

  async loadAssets(): Promise<Map<string, any>> {
    this.loadStartTime = performance.now();
    performanceMonitor.startMonitoring();
    
    // Sort assets by priority
    const sortedAssets = [...this.loadingQueue].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.strategy.priority] - priorityOrder[b.strategy.priority];
    });
    
    // Load critical and high priority assets first
    const criticalAssets = sortedAssets.filter(a => 
      a.strategy.priority === 'critical' || a.strategy.priority === 'high'
    );
    
    const otherAssets = sortedAssets.filter(a => 
      a.strategy.priority === 'medium' || a.strategy.priority === 'low'
    );
    
    // Load critical assets sequentially for better error handling
    for (const asset of criticalAssets) {
      try {
        this.loadingProgress.currentAsset = asset.id;
        await this.loadSingleAsset(asset);
        this.loadingProgress.loaded++;
        this.loadingProgress.bytesLoaded += asset.size;
        this.updateTimeEstimate();
        this.notifyProgress();
        performanceMonitor.logProgress(
          (this.loadingProgress.loaded / this.loadingProgress.total) * 100,
          asset.id
        );
      } catch (error) {
        console.error(`Critical asset ${asset.id} failed to load:`, error);
        performanceMonitor.logError(asset.id);
      }
    }
    
    // Load other assets in parallel with concurrency limit
    const concurrencyLimit = this.connectionSpeed === 'slow' ? 2 : 
                            this.connectionSpeed === 'medium' ? 4 : 6;
    
    const loadPromises: Promise<void>[] = [];
    let activeLoads = 0;
    
    for (const asset of otherAssets) {
      if (activeLoads >= concurrencyLimit) {
        await Promise.race(loadPromises);
      }
      
      const loadPromise = this.loadSingleAsset(asset)
        .then(() => {
          this.loadingProgress.loaded++;
          this.loadingProgress.bytesLoaded += asset.size;
          this.updateTimeEstimate();
          this.notifyProgress();
          performanceMonitor.logProgress(
            (this.loadingProgress.loaded / this.loadingProgress.total) * 100,
            asset.id
          );
        })
        .catch(error => {
          console.warn(`Asset ${asset.id} failed to load:`, error);
          performanceMonitor.logError(asset.id);
        })
        .finally(() => {
          activeLoads--;
        });
      
      loadPromises.push(loadPromise);
      activeLoads++;
    }
    
    // Wait for all remaining loads to complete
    await Promise.allSettled(loadPromises);
    
    performanceMonitor.completeMonitoring(this.loadingProgress.total);
    
    return this.loadedAssets;
  }

  private updateTimeEstimate() {
    const elapsed = performance.now() - this.loadStartTime;
    const progress = this.loadingProgress.loaded / this.loadingProgress.total;
    
    if (progress > 0) {
      const totalEstimatedTime = elapsed / progress;
      this.loadingProgress.estimatedTimeRemaining = Math.max(0, totalEstimatedTime - elapsed);
    }
  }

  getAsset(id: string): any {
    return this.loadedAssets.get(id);
  }

  hasAsset(id: string): boolean {
    return this.loadedAssets.has(id);
  }

  getMemoryUsage(): number {
    return this.currentMemoryUsage;
  }

  getMemoryBudget(): number {
    return this.memoryBudget;
  }

  cleanup() {
    // Dispose of loaded assets
    this.loadedAssets.forEach((asset, id) => {
      if (asset && typeof asset.dispose === 'function') {
        asset.dispose();
      }
      
      // Revoke object URLs to free memory
      if (asset instanceof HTMLImageElement || asset instanceof HTMLAudioElement) {
        URL.revokeObjectURL(asset.src);
      }
    });
    
    this.loadedAssets.clear();
    this.failedAssets.clear();
    this.loadingQueue = [];
    this.currentMemoryUsage = 0;
    this.progressCallbacks = [];
    this.loadingProgress = {
      loaded: 0,
      total: 0,
      bytesLoaded: 0,
      bytesTotal: 0,
      estimatedTimeRemaining: 0
    };
  }
}

// Singleton instance
export const performanceAssetLoader = new PerformanceAssetLoader();

// Utility functions for creating loading strategies
export function createLoadingStrategy(
  priority: AssetLoadingStrategy['priority'],
  options: Partial<AssetLoadingStrategy> = {}
): AssetLoadingStrategy {
  return {
    priority,
    loadCondition: options.loadCondition || (() => true),
    fallbackAsset: options.fallbackAsset,
    maxRetries: options.maxRetries || 3,
    timeout: options.timeout || (priority === 'critical' ? 10000 : priority === 'high' ? 5000 : 3000)
  };
}

// Network-aware asset definitions
export function createNetworkAwareAsset(
  id: string,
  baseUrl: string,
  type: NetworkAwareAsset['type'],
  size: number,
  strategy: AssetLoadingStrategy,
  alternatives?: NetworkAwareAsset['alternatives']
): NetworkAwareAsset {
  return {
    id,
    url: baseUrl,
    type,
    size,
    strategy,
    alternatives
  };
}