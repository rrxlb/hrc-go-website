/**
 * WebGL capability detection utilities
 * Provides graceful degradation for devices that don't support WebGL
 */

import React from 'react';

export interface WebGLCapabilities {
  hasWebGL: boolean;
  hasWebGL2: boolean;
  maxTextureSize: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  extensions: string[];
  renderer: string;
  vendor: string;
  version: string;
}

/**
 * Detects WebGL support and capabilities
 */
export function detectWebGLCapabilities(): WebGLCapabilities {
  const canvas = document.createElement('canvas');
  const defaultCapabilities: WebGLCapabilities = {
    hasWebGL: false,
    hasWebGL2: false,
    maxTextureSize: 0,
    maxVertexUniforms: 0,
    maxFragmentUniforms: 0,
    extensions: [],
    renderer: 'Unknown',
    vendor: 'Unknown',
    version: 'Unknown'
  };

  try {
    // Test WebGL 2.0 first
    let gl = canvas.getContext('webgl2') as WebGLRenderingContext | WebGL2RenderingContext | null;
    let hasWebGL2 = !!gl;

    // Fallback to WebGL 1.0
    if (!gl) {
      gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      if (!gl) {
        gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      }
    }

    if (!gl) {
      return defaultCapabilities;
    }

    // Get debug info extension for renderer details
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter((debugInfo as any).UNMASKED_RENDERER_WEBGL) : 'Unknown';
    const vendor = debugInfo ? gl.getParameter((debugInfo as any).UNMASKED_VENDOR_WEBGL) : 'Unknown';

    // Get available extensions
    const extensions = gl.getSupportedExtensions() || [];

    return {
      hasWebGL: true,
      hasWebGL2,
      maxTextureSize: gl.getParameter((gl as any).MAX_TEXTURE_SIZE || 0x0D33),
      maxVertexUniforms: gl.getParameter((gl as any).MAX_VERTEX_UNIFORM_VECTORS || 0x8DFB),
      maxFragmentUniforms: gl.getParameter((gl as any).MAX_FRAGMENT_UNIFORM_VECTORS || 0x8DFD),
      extensions,
      renderer: renderer.toString(),
      vendor: vendor.toString(),
      version: gl.getParameter((gl as any).VERSION || 0x1F02).toString()
    };
  } catch (error) {
    console.warn('WebGL detection failed:', error);
    return defaultCapabilities;
  } finally {
    // Clean up canvas
    canvas.remove();
  }
}

/**
 * Checks if the device can handle 3D graphics adequately
 */
export function canHandle3DGraphics(): boolean {
  const capabilities = detectWebGLCapabilities();
  
  if (!capabilities.hasWebGL) {
    return false;
  }

  // Check minimum requirements for casino 3D experience
  const minTextureSize = 1024;
  const minVertexUniforms = 128;
  const minFragmentUniforms = 16;

  return (
    capabilities.maxTextureSize >= minTextureSize &&
    capabilities.maxVertexUniforms >= minVertexUniforms &&
    capabilities.maxFragmentUniforms >= minFragmentUniforms
  );
}

/**
 * Determines the appropriate graphics quality level
 */
export function getRecommendedQuality(): 'low' | 'medium' | 'high' {
  const capabilities = detectWebGLCapabilities();
  
  if (!capabilities.hasWebGL) {
    return 'low';
  }

  // High-end devices
  if (
    capabilities.hasWebGL2 &&
    capabilities.maxTextureSize >= 4096 &&
    capabilities.extensions.includes('EXT_texture_filter_anisotropic')
  ) {
    return 'high';
  }

  // Mid-range devices
  if (
    capabilities.maxTextureSize >= 2048 &&
    capabilities.maxVertexUniforms >= 256
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Hook for WebGL capabilities detection
 */
export function useWebGLCapabilities() {
  const [capabilities, setCapabilities] = React.useState<WebGLCapabilities | null>(null);
  const [canRender3D, setCanRender3D] = React.useState<boolean>(false);
  const [quality, setQuality] = React.useState<'low' | 'medium' | 'high'>('medium');

  React.useEffect(() => {
    const detected = detectWebGLCapabilities();
    setCapabilities(detected);
    setCanRender3D(canHandle3DGraphics());
    setQuality(getRecommendedQuality());
  }, []);

  return {
    capabilities,
    canRender3D,
    quality,
    isLoading: capabilities === null
  };
}