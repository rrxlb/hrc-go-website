/**
 * CDN configuration for global asset delivery
 * Handles asset routing, caching, and optimization
 */

interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheControl: {
    images: string;
    models: string;
    audio: string;
    static: string;
  };
  optimization: {
    imageFormats: string[];
    compression: boolean;
    minify: boolean;
  };
}

/**
 * CDN configuration based on environment
 */
export const cdnConfig: CDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
  regions: [
    'us-east-1',
    'us-west-2',
    'eu-west-1',
    'ap-southeast-1',
    'ap-northeast-1'
  ],
  cacheControl: {
    images: 'public, max-age=31536000, immutable', // 1 year
    models: 'public, max-age=31536000, immutable', // 1 year
    audio: 'public, max-age=31536000, immutable',  // 1 year
    static: 'public, max-age=86400',               // 1 day
  },
  optimization: {
    imageFormats: ['avif', 'webp', 'jpg'],
    compression: true,
    minify: true,
  }
};

/**
 * CDN asset URL builder
 */
export class CDNAssetBuilder {
  private config: CDNConfig;

  constructor(config: CDNConfig = cdnConfig) {
    this.config = config;
  }

  /**
   * Build optimized asset URL for images
   */
  buildImageUrl(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'avif' | 'webp' | 'jpg' | 'png';
  } = {}): string {
    if (!this.config.baseUrl || this.isExternalUrl(src)) {
      return src;
    }

    const cleanSrc = this.cleanPath(src);
    const params = new URLSearchParams();

    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);

    // Add optimization flags
    if (this.config.optimization.compression) {
      params.set('compress', 'true');
    }

    const queryString = params.toString();
    return `${this.config.baseUrl}/${cleanSrc}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Build asset URL for 3D models
   */
  buildModelUrl(src: string, options: {
    quality?: 'low' | 'medium' | 'high';
    compression?: 'gzip' | 'brotli';
  } = {}): string {
    if (!this.config.baseUrl || this.isExternalUrl(src)) {
      return src;
    }

    const cleanSrc = this.cleanPath(src);
    const params = new URLSearchParams();

    if (options.quality) params.set('quality', options.quality);
    if (options.compression) params.set('compress', options.compression);

    const queryString = params.toString();
    return `${this.config.baseUrl}/${cleanSrc}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Build asset URL for audio files
   */
  buildAudioUrl(src: string, options: {
    quality?: number;
    format?: 'mp3' | 'ogg' | 'wav';
  } = {}): string {
    if (!this.config.baseUrl || this.isExternalUrl(src)) {
      return src;
    }

    const cleanSrc = this.cleanPath(src);
    const params = new URLSearchParams();

    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);

    const queryString = params.toString();
    return `${this.config.baseUrl}/${cleanSrc}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Get cache control headers for asset type
   */
  getCacheControl(assetType: 'images' | 'models' | 'audio' | 'static'): string {
    return this.config.cacheControl[assetType];
  }

  /**
   * Check if URL is external
   */
  private isExternalUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
  }

  /**
   * Clean asset path
   */
  private cleanPath(path: string): string {
    return path.startsWith('/') ? path.slice(1) : path;
  }

  /**
   * Get optimal CDN region based on user location
   */
  getOptimalRegion(): string {
    if (typeof window === 'undefined') {
      return this.config.regions[0];
    }

    // Simple region detection based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone.includes('America')) {
      return 'us-east-1';
    } else if (timezone.includes('Europe')) {
      return 'eu-west-1';
    } else if (timezone.includes('Asia')) {
      return 'ap-southeast-1';
    }

    return this.config.regions[0];
  }
}

// Global CDN asset builder instance
export const cdnAssetBuilder = new CDNAssetBuilder();

/**
 * Utility functions for common asset types
 */
export function getCDNImageUrl(src: string, width?: number, quality?: number): string {
  return cdnAssetBuilder.buildImageUrl(src, { width, quality });
}

export function getCDNModelUrl(src: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
  return cdnAssetBuilder.buildModelUrl(src, { quality, compression: 'gzip' });
}

export function getCDNAudioUrl(src: string, quality: number = 128): string {
  return cdnAssetBuilder.buildAudioUrl(src, { quality, format: 'mp3' });
}

/**
 * Preload critical assets through CDN
 */
export function preloadCDNAssets(assets: Array<{
  src: string;
  type: 'image' | 'model' | 'audio';
  priority?: 'high' | 'low';
}>): void {
  if (typeof window === 'undefined') return;

  assets.forEach(({ src, type, priority = 'low' }) => {
    const link = document.createElement('link');
    link.rel = priority === 'high' ? 'preload' : 'prefetch';

    switch (type) {
      case 'image':
        link.as = 'image';
        link.href = getCDNImageUrl(src, 1920, 85);
        break;
      case 'model':
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        link.href = getCDNModelUrl(src, 'high');
        break;
      case 'audio':
        link.as = 'audio';
        link.href = getCDNAudioUrl(src, 320);
        break;
    }

    document.head.appendChild(link);
  });
}

/**
 * Generate resource hints for better performance
 */
export function generateResourceHints(): Array<{ rel: string; href: string; crossOrigin?: string }> {
  if (!cdnConfig.baseUrl) return [];

  return [
    {
      rel: 'dns-prefetch',
      href: cdnConfig.baseUrl
    },
    {
      rel: 'preconnect',
      href: cdnConfig.baseUrl,
      crossOrigin: 'anonymous'
    }
  ];
}