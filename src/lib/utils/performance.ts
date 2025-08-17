import { PerformanceMetrics } from '@/lib/types';

export class PerformanceMonitor {
  private fps = 0;
  private frameCount = 0;
  private lastTime = performance.now();
  private memory = 0;
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    const updateMetrics = () => {
      const currentTime = performance.now();
      this.frameCount++;

      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;

        // Update memory usage if available
        if ('memory' in performance) {
          this.memory = (performance as any).memory.usedJSHeapSize / 1048576; // MB
        }

        // Notify callbacks
        const metrics: PerformanceMetrics = {
          fps: this.fps,
          memory: this.memory,
          drawCalls: 0, // Will be updated by Three.js renderer
          triangles: 0  // Will be updated by Three.js renderer
        };

        this.callbacks.forEach(callback => callback(metrics));
      }

      requestAnimationFrame(updateMetrics);
    };

    requestAnimationFrame(updateMetrics);
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public getCurrentMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      memory: this.memory,
      drawCalls: 0,
      triangles: 0
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const getDeviceCapabilities = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl || !(gl instanceof WebGLRenderingContext)) {
    return {
      webgl: false,
      webgl2: false,
      maxTextureSize: 0,
      maxVertexUniforms: 0,
      maxFragmentUniforms: 0,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  const webgl2 = !!canvas.getContext('webgl2');
  
  return {
    webgl: true,
    webgl2,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) as number,
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) as number,
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2)
  };
};

export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isLowEndDevice = () => {
  const capabilities = getDeviceCapabilities();
  const mobile = isMobile();
  
  return (
    mobile ||
    capabilities.maxTextureSize < 4096 ||
    navigator.hardwareConcurrency < 4 ||
    (performance as any).memory?.jsHeapSizeLimit < 1073741824 // 1GB
  );
};