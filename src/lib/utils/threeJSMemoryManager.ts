'use client';

import * as THREE from 'three';
import { performanceMonitor } from './performanceMonitor';
import { useEffect } from 'react';

interface MemoryTrackingInfo {
  id: string;
  type: 'geometry' | 'texture' | 'material' | 'mesh' | 'scene';
  size: number; // estimated size in bytes
  createdAt: number;
  lastUsed: number;
  useCount: number;
}

interface MemoryBudget {
  geometries: number;
  textures: number;
  materials: number;
  total: number;
}

class ThreeJSMemoryManager {
  private trackedObjects: Map<string, MemoryTrackingInfo> = new Map();
  private disposalQueue: Set<string> = new Set();
  private memoryBudget: MemoryBudget;
  private currentUsage = {
    geometries: 0,
    textures: 0,
    materials: 0,
    total: 0
  };
  private cleanupInterval?: number;
  private renderer?: THREE.WebGLRenderer;

  constructor(memoryBudgetMB: number = 100) {
    this.memoryBudget = {
      geometries: memoryBudgetMB * 0.3 * 1024 * 1024, // 30% for geometries
      textures: memoryBudgetMB * 0.6 * 1024 * 1024,   // 60% for textures
      materials: memoryBudgetMB * 0.1 * 1024 * 1024,  // 10% for materials
      total: memoryBudgetMB * 1024 * 1024
    };

    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  setRenderer(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    performanceMonitor.setThreeRenderer(renderer);
  }

  // Track a Three.js object
  trackObject(
    object: THREE.Object3D | THREE.BufferGeometry | THREE.Material | THREE.Texture,
    id: string,
    type: MemoryTrackingInfo['type']
  ): void {
    const size = this.estimateObjectSize(object, type);
    
    const info: MemoryTrackingInfo = {
      id,
      type,
      size,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      useCount: 1
    };

    this.trackedObjects.set(id, info);
    this.updateUsage(type, size, 'add');

    // Check if we're exceeding budget
    if (this.isOverBudget()) {
      this.performEmergencyCleanup();
    }
  }

  // Update usage tracking when object is accessed
  touchObject(id: string): void {
    const info = this.trackedObjects.get(id);
    if (info) {
      info.lastUsed = Date.now();
      info.useCount++;
    }
  }

  // Manually dispose of an object
  disposeObject(id: string): boolean {
    const info = this.trackedObjects.get(id);
    if (!info) return false;

    this.updateUsage(info.type, info.size, 'remove');
    this.trackedObjects.delete(id);
    
    return true;
  }

  // Queue object for disposal
  queueForDisposal(id: string): void {
    this.disposalQueue.add(id);
  }

  // Process disposal queue
  processDisposalQueue(): void {
    for (const id of this.disposalQueue) {
      this.disposeObject(id);
    }
    this.disposalQueue.clear();
  }

  private estimateObjectSize(
    object: THREE.Object3D | THREE.BufferGeometry | THREE.Material | THREE.Texture,
    type: MemoryTrackingInfo['type']
  ): number {
    switch (type) {
      case 'geometry':
        if (object instanceof THREE.BufferGeometry) {
          let size = 0;
          const attributes = object.attributes;
          for (const key in attributes) {
            const attribute = attributes[key];
            size += attribute.array.byteLength;
          }
          if (object.index) {
            size += object.index.array.byteLength;
          }
          return size;
        }
        return 1024; // Default estimate

      case 'texture':
        if (object instanceof THREE.Texture && object.image) {
          const width = object.image.width || 512;
          const height = object.image.height || 512;
          const channels = 4; // RGBA
          const bytesPerChannel = 1; // 8-bit
          return width * height * channels * bytesPerChannel;
        }
        return 512 * 512 * 4; // Default 512x512 RGBA

      case 'material':
        // Materials are relatively small, mostly references
        return 1024;

      case 'mesh':
        // Meshes themselves are small, just references
        return 256;

      case 'scene':
        // Scenes are containers, minimal memory
        return 128;

      default:
        return 1024;
    }
  }

  private updateUsage(type: MemoryTrackingInfo['type'], size: number, operation: 'add' | 'remove'): void {
    const multiplier = operation === 'add' ? 1 : -1;
    
    switch (type) {
      case 'geometry':
        this.currentUsage.geometries += size * multiplier;
        break;
      case 'texture':
        this.currentUsage.textures += size * multiplier;
        break;
      case 'material':
        this.currentUsage.materials += size * multiplier;
        break;
    }
    
    this.currentUsage.total += size * multiplier;
  }

  private isOverBudget(): boolean {
    return (
      this.currentUsage.geometries > this.memoryBudget.geometries ||
      this.currentUsage.textures > this.memoryBudget.textures ||
      this.currentUsage.materials > this.memoryBudget.materials ||
      this.currentUsage.total > this.memoryBudget.total
    );
  }

  private performEmergencyCleanup(): void {
    console.warn('Three.js memory budget exceeded, performing emergency cleanup');
    
    // Get objects sorted by last used time (oldest first)
    const objectsToCleanup = Array.from(this.trackedObjects.entries())
      .sort(([, a], [, b]) => a.lastUsed - b.lastUsed)
      .slice(0, Math.ceil(this.trackedObjects.size * 0.2)); // Remove oldest 20%

    for (const [id, info] of objectsToCleanup) {
      this.disposeObject(id);
      console.log(`Emergency cleanup: Disposed ${info.type} ${id}`);
    }
  }

  private startPeriodicCleanup(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.performPeriodicCleanup();
    }, 30000); // Every 30 seconds
  }

  private performPeriodicCleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const objectsToCleanup: string[] = [];

    // Find objects that haven't been used recently
    for (const [id, info] of this.trackedObjects) {
      if (now - info.lastUsed > maxAge && info.useCount < 5) {
        objectsToCleanup.push(id);
      }
    }

    // Clean up old objects
    for (const id of objectsToCleanup) {
      this.disposeObject(id);
    }

    if (objectsToCleanup.length > 0) {
      console.log(`Periodic cleanup: Disposed ${objectsToCleanup.length} unused objects`);
    }

    // Update performance monitor
    if (this.renderer) {
      performanceMonitor.trackThreeJSMemory();
    }
  }

  // Get memory usage statistics
  getMemoryStats() {
    return {
      usage: { ...this.currentUsage },
      budget: { ...this.memoryBudget },
      utilization: {
        geometries: this.currentUsage.geometries / this.memoryBudget.geometries,
        textures: this.currentUsage.textures / this.memoryBudget.textures,
        materials: this.currentUsage.materials / this.memoryBudget.materials,
        total: this.currentUsage.total / this.memoryBudget.total
      },
      trackedObjects: this.trackedObjects.size,
      queuedForDisposal: this.disposalQueue.size
    };
  }

  // Optimize memory usage
  optimizeMemory(): void {
    // Process disposal queue
    this.processDisposalQueue();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Compact texture memory if renderer is available
    if (this.renderer) {
      this.renderer.info.autoReset = false;
      this.renderer.info.reset();
      this.renderer.info.autoReset = true;
    }
  }

  // Cleanup all tracked objects
  cleanup(): void {
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    // Dispose all tracked objects
    for (const id of this.trackedObjects.keys()) {
      this.disposeObject(id);
    }

    // Clear disposal queue
    this.disposalQueue.clear();

    // Reset usage counters
    this.currentUsage = {
      geometries: 0,
      textures: 0,
      materials: 0,
      total: 0
    };

    console.log('Three.js memory manager cleanup completed');
  }

  // Helper methods for specific Three.js objects
  trackGeometry(geometry: THREE.BufferGeometry, id: string): void {
    this.trackObject(geometry, id, 'geometry');
    
    // Add cleanup callback to geometry
    const originalDispose = geometry.dispose.bind(geometry);
    geometry.dispose = () => {
      this.disposeObject(id);
      originalDispose();
    };
  }

  trackTexture(texture: THREE.Texture, id: string): void {
    this.trackObject(texture, id, 'texture');
    
    // Add cleanup callback to texture
    const originalDispose = texture.dispose.bind(texture);
    texture.dispose = () => {
      this.disposeObject(id);
      originalDispose();
    };
  }

  trackMaterial(material: THREE.Material, id: string): void {
    this.trackObject(material, id, 'material');
    
    // Add cleanup callback to material
    const originalDispose = material.dispose.bind(material);
    material.dispose = () => {
      this.disposeObject(id);
      originalDispose();
    };
  }

  // Batch operations for better performance
  trackScene(scene: THREE.Scene, sceneId: string): void {
    this.trackObject(scene, sceneId, 'scene');
    
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const meshId = `${sceneId}_mesh_${object.uuid}`;
        this.trackObject(object, meshId, 'mesh');
        
        if (object.geometry) {
          const geomId = `${sceneId}_geom_${object.geometry.uuid}`;
          this.trackGeometry(object.geometry, geomId);
        }
        
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material, index) => {
            const matId = `${sceneId}_mat_${material.uuid}_${index}`;
            this.trackMaterial(material, matId);
          });
        }
      }
    });
  }
}

// Singleton instance
export const threeJSMemoryManager = new ThreeJSMemoryManager();

// React hook for automatic Three.js memory management
export function useThreeJSMemoryManagement(renderer?: THREE.WebGLRenderer) {

  
  useEffect(() => {
    if (renderer) {
      threeJSMemoryManager.setRenderer(renderer);
    }
    
    // Cleanup on unmount
    return () => {
      threeJSMemoryManager.cleanup();
    };
  }, [renderer]);
  
  return {
    trackGeometry: threeJSMemoryManager.trackGeometry.bind(threeJSMemoryManager),
    trackTexture: threeJSMemoryManager.trackTexture.bind(threeJSMemoryManager),
    trackMaterial: threeJSMemoryManager.trackMaterial.bind(threeJSMemoryManager),
    trackScene: threeJSMemoryManager.trackScene.bind(threeJSMemoryManager),
    getStats: threeJSMemoryManager.getMemoryStats.bind(threeJSMemoryManager),
    optimize: threeJSMemoryManager.optimizeMemory.bind(threeJSMemoryManager)
  };
}