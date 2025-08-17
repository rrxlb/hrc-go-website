/**
 * Device detection and capability utilities for responsive design
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  pixelRatio: number;
  webglSupport: boolean;
  maxTextureSize: number;
  memoryLimit: number;
  connectionSpeed: 'slow' | 'medium' | 'fast';
}

export function detectDevice(): DeviceCapabilities {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  // Device type detection
  const isMobile = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent) || (width >= 768 && width < 1024);
  const isDesktop = !isMobile && !isTablet;

  // Touch support
  const hasTouch = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Screen size classification
  let screenSize: DeviceCapabilities['screenSize'] = 'md';
  if (width < 475) screenSize = 'xs';
  else if (width < 640) screenSize = 'sm';
  else if (width < 768) screenSize = 'md';
  else if (width < 1024) screenSize = 'lg';
  else if (width < 1280) screenSize = 'xl';
  else if (width < 1536) screenSize = '2xl';
  else screenSize = '3xl';

  // WebGL capabilities
  let webglSupport = false;
  let maxTextureSize = 0;
  
  if (typeof window !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl && gl instanceof WebGLRenderingContext) {
        webglSupport = true;
        maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      }
    } catch (error) {
      // WebGL not supported or canvas not available (e.g., in tests)
      webglSupport = false;
      maxTextureSize = 0;
    }
  }

  // Memory estimation (rough heuristic)
  let memoryLimit = 512; // MB, conservative default
  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
    memoryLimit = (navigator as any).deviceMemory * 1024; // Convert GB to MB
  } else if (typeof navigator !== 'undefined') {
    // Estimate based on device type and screen resolution
    if (isMobile) {
      memoryLimit = width > 414 ? 1024 : 512; // iPhone Pro vs regular
    } else if (isTablet) {
      memoryLimit = 2048;
    } else {
      memoryLimit = 4096;
    }
  }

  // Connection speed detection
  let connectionSpeed: DeviceCapabilities['connectionSpeed'] = 'medium';
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      connectionSpeed = 'slow';
    } else if (effectiveType === '4g' || connection?.downlink > 10) {
      connectionSpeed = 'fast';
    }
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    screenSize,
    pixelRatio,
    webglSupport,
    maxTextureSize,
    memoryLimit,
    connectionSpeed
  };
}

export function shouldUseLOD(capabilities: DeviceCapabilities): boolean {
  return (
    capabilities.isMobile ||
    capabilities.memoryLimit < 1024 ||
    capabilities.connectionSpeed === 'slow' ||
    !capabilities.webglSupport ||
    capabilities.maxTextureSize < 2048
  );
}

export function getOptimalQualitySettings(capabilities: DeviceCapabilities) {
  const useLOD = shouldUseLOD(capabilities);
  
  return {
    // 3D Scene settings
    shadowMapSize: useLOD ? 512 : capabilities.isMobile ? 1024 : 2048,
    antialias: !capabilities.isMobile && capabilities.pixelRatio <= 2,
    pixelRatio: Math.min(capabilities.pixelRatio, capabilities.isMobile ? 2 : 3),
    
    // Texture settings
    textureSize: useLOD ? 512 : capabilities.isMobile ? 1024 : 2048,
    anisotropy: capabilities.isMobile ? 1 : 4,
    
    // Animation settings
    targetFPS: capabilities.isMobile ? 30 : 60,
    reducedMotion: capabilities.connectionSpeed === 'slow',
    
    // LOD settings
    enableLOD: useLOD,
    lodDistance: capabilities.isMobile ? 5 : 10,
    maxLODLevel: capabilities.isMobile ? 2 : 3,
    
    // UI settings
    compactUI: capabilities.screenSize === 'xs' || capabilities.screenSize === 'sm',
    touchOptimized: capabilities.hasTouch,
    
    // Performance settings
    enablePerformanceMonitoring: true,
    autoQualityAdjustment: capabilities.isMobile || capabilities.connectionSpeed === 'slow'
  };
}

// React hook for device capabilities
export function useDeviceCapabilities() {
  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      screenSize: 'lg' as const,
      pixelRatio: 1,
      webglSupport: true,
      maxTextureSize: 2048,
      memoryLimit: 4096,
      connectionSpeed: 'fast' as const
    };
  }

  return detectDevice();
}