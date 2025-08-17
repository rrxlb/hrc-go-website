/**
 * Custom image loader for CDN optimization
 * Handles image optimization and delivery through CDN
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const cdnUrl = process.env.CDN_URL || '';
  
  // If no CDN is configured, return the original src
  if (!cdnUrl) {
    return src;
  }

  // Handle absolute URLs (external images)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Remove leading slash if present
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
  
  // Build optimized image URL with CDN
  const params = new URLSearchParams();
  params.set('w', width.toString());
  
  if (quality) {
    params.set('q', quality.toString());
  }

  // Add format optimization
  params.set('f', 'webp');
  
  // Add cache control
  params.set('c', '31536000'); // 1 year cache

  return `${cdnUrl}/${cleanSrc}?${params.toString()}`;
}

/**
 * Asset loader for 3D models and other static assets
 */
export function assetLoader(src: string): string {
  const cdnUrl = process.env.CDN_URL || '';
  
  if (!cdnUrl || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
  return `${cdnUrl}/${cleanSrc}`;
}

/**
 * Preload critical assets for better performance
 */
export function preloadAsset(src: string, type: 'image' | 'model' | 'audio' = 'image'): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  
  switch (type) {
    case 'image':
      link.as = 'image';
      link.href = imageLoader({ src, width: 1920, quality: 85 });
      break;
    case 'model':
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      link.href = assetLoader(src);
      break;
    case 'audio':
      link.as = 'audio';
      link.href = assetLoader(src);
      break;
  }

  document.head.appendChild(link);
}