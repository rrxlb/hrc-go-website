/**
 * Asset optimization utilities for 3D models, textures, and other casino assets
 * Handles compression, caching, and progressive loading
 */

import { Texture, TextureLoader, CompressedTexture } from 'three';

interface AssetConfig {
  quality: 'low' | 'medium' | 'high';
  maxSize: number;
  format: string;
  compression: boolean;
}

interface OptimizedAsset {
  url: string;
  size: number;
  format: string;
  compressed: boolean;
  cacheable: boolean;
}

/**
 * Asset optimization configuration based on device capabilities
 */
export class AssetOptimizer {
  private config: AssetConfig;
  private cache: Map<string, OptimizedAsset> = new Map();

  constructor() {
    this.config = this.detectOptimalConfig();
  }

  /**
   * Detect optimal asset configuration based on device capabilities
   */
  private detectOptimalConfig(): AssetConfig {
    if (typeof window === 'undefined') {
      return { quality: 'high', maxSize: 10 * 1024 * 1024, format: 'webp', compression: true };
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      return { quality: 'low', maxSize: 1 * 1024 * 1024, format: 'jpg', compression: true };
    }

    // Check device memory and connection
    const memory = (navigator as any).deviceMemory || 4;
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';

    // Determine quality based on device capabilities
    let quality: 'low' | 'medium' | 'high' = 'medium';
    let maxSize = 5 * 1024 * 1024; // 5MB default

    if (memory >= 8 && effectiveType === '4g') {
      quality = 'high';
      maxSize = 10 * 1024 * 1024; // 10MB
    } else if (memory <= 2 || effectiveType === '3g') {
      quality = 'low';
      maxSize = 2 * 1024 * 1024; // 2MB
    }

    return {
      quality,
      maxSize,
      format: this.getSupportedFormat(),
      compression: true
    };
  }

  /**
   * Get the best supported image format
   */
  private getSupportedFormat(): string {
    if (typeof window === 'undefined') return 'webp';

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    // Check AVIF support
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif';
    }

    // Check WebP support
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp';
    }

    return 'jpg';
  }

  /**
   * Optimize texture loading with appropriate quality and compression
   */
  async optimizeTexture(url: string): Promise<Texture> {
    const cacheKey = `texture_${url}_${this.config.quality}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return new TextureLoader().load(cached.url);
    }

    const optimizedUrl = this.getOptimizedAssetUrl(url, 'texture');
    const texture = await new Promise<Texture>((resolve, reject) => {
      new TextureLoader().load(
        optimizedUrl,
        resolve,
        undefined,
        reject
      );
    });

    // Cache the optimized asset info
    this.cache.set(cacheKey, {
      url: optimizedUrl,
      size: 0, // Would be populated by actual file size
      format: this.config.format,
      compressed: this.config.compression,
      cacheable: true
    });

    return texture;
  }

  /**
   * Get optimized asset URL with quality and format parameters
   */
  getOptimizedAssetUrl(url: string, type: 'texture' | 'model' | 'audio'): string {
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
    
    if (!cdnUrl || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const params = new URLSearchParams();

    switch (type) {
      case 'texture':
        params.set('quality', this.config.quality);
        params.set('format', this.config.format);
        if (this.config.compression) {
          params.set('compress', 'true');
        }
        break;
      
      case 'model':
        params.set('quality', this.config.quality);
        if (this.config.compression) {
          params.set('compress', 'gzip');
        }
        break;
      
      case 'audio':
        params.set('quality', this.config.quality === 'high' ? '320' : '128');
        params.set('format', 'mp3');
        break;
    }

    // Add cache control
    params.set('cache', '31536000'); // 1 year

    return `${cdnUrl}/${cleanUrl}?${params.toString()}`;
  }

  /**
   * Preload critical assets for better performance
   */
  preloadCriticalAssets(assets: Array<{ url: string; type: 'texture' | 'model' | 'audio' }>): void {
    if (typeof window === 'undefined') return;

    assets.forEach(({ url, type }) => {
      const optimizedUrl = this.getOptimizedAssetUrl(url, type);
      
      const link = document.createElement('link');
      link.rel = 'preload';
      
      switch (type) {
        case 'texture':
          link.as = 'image';
          break;
        case 'model':
          link.as = 'fetch';
          link.crossOrigin = 'anonymous';
          break;
        case 'audio':
          link.as = 'audio';
          break;
      }
      
      link.href = optimizedUrl;
      document.head.appendChild(link);
    });
  }

  /**
   * Get current optimization configuration
   */
  getConfig(): AssetConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (useful for runtime optimization adjustments)
   */
  updateConfig(newConfig: Partial<AssetConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache.clear(); // Clear cache when config changes
  }

  /**
   * Clear asset cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: number } {
    return {
      size: Array.from(this.cache.values()).reduce((total, asset) => total + asset.size, 0),
      entries: this.cache.size
    };
  }
}

// Global asset optimizer instance
export const assetOptimizer = new AssetOptimizer();

/**
 * Utility function to get optimized asset URL
 */
export function getOptimizedAssetUrl(url: string, type: 'texture' | 'model' | 'audio' = 'texture'): string {
  return assetOptimizer.getOptimizedAssetUrl(url, type);
}

/**
 * Utility function to preload assets
 */
export function preloadAssets(assets: Array<{ url: string; type: 'texture' | 'model' | 'audio' }>): void {
  assetOptimizer.preloadCriticalAssets(assets);
}