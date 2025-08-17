'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3, LOD, Mesh, BufferGeometry, Material } from 'three';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';

interface LODSystemProps {
  children: React.ReactNode;
  enabled?: boolean;
  maxDistance?: number;
  levels?: number;
}

interface LODLevel {
  distance: number;
  quality: 'high' | 'medium' | 'low';
  geometryScale: number;
  textureScale: number;
  shadowsEnabled: boolean;
}

export default function LODSystem({
  children,
  enabled = true,
  maxDistance = 15,
  levels = 3
}: LODSystemProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  const capabilities = useDeviceCapabilities();
  
  // Define LOD levels based on device capabilities
  const lodLevels = useMemo<LODLevel[]>(() => {
    const baseLevels: LODLevel[] = [
      {
        distance: 0,
        quality: 'high',
        geometryScale: 1,
        textureScale: 1,
        shadowsEnabled: true
      },
      {
        distance: maxDistance * 0.4,
        quality: 'medium',
        geometryScale: 0.7,
        textureScale: 0.5,
        shadowsEnabled: !capabilities.isMobile
      },
      {
        distance: maxDistance * 0.7,
        quality: 'low',
        geometryScale: 0.4,
        textureScale: 0.25,
        shadowsEnabled: false
      }
    ];

    // Adjust levels based on device capabilities
    if (capabilities.isMobile) {
      return baseLevels.map((level, index) => ({
        ...level,
        distance: level.distance * 0.5, // More aggressive distance reduction on mobile
        shadowsEnabled: false, // Disable shadows on mobile
        textureScale: level.textureScale * 0.4, // More aggressive texture reduction
        geometryScale: level.geometryScale * 0.8 // Reduce geometry complexity
      }));
    }

    // Tablet optimizations
    if (capabilities.isTablet) {
      return baseLevels.map(level => ({
        ...level,
        distance: level.distance * 0.8,
        shadowsEnabled: level.quality === 'high', // Only high quality shadows on tablet
        textureScale: level.textureScale * 0.7
      }));
    }

    // Low-end device optimizations
    if (capabilities.memoryLimit < 1024 || capabilities.connectionSpeed === 'slow') {
      return baseLevels.map(level => ({
        ...level,
        distance: level.distance * 0.7,
        shadowsEnabled: false,
        textureScale: level.textureScale * 0.6
      }));
    }

    return baseLevels.slice(0, levels);
  }, [maxDistance, levels, capabilities]);

  // Current LOD level state
  const currentLODLevel = useRef(0);
  const cameraPosition = useRef(new Vector3());

  // Update LOD based on camera distance
  useFrame(() => {
    if (!enabled || !groupRef.current) return;

    cameraPosition.current.copy(camera.position);
    const distanceToCenter = cameraPosition.current.distanceTo(new Vector3(0, 0, 0));
    
    // Determine current LOD level
    let newLODLevel = lodLevels.length - 1;
    for (let i = 0; i < lodLevels.length; i++) {
      if (distanceToCenter <= lodLevels[i].distance || i === 0) {
        newLODLevel = i;
        break;
      }
    }

    // Update LOD if changed
    if (newLODLevel !== currentLODLevel.current) {
      currentLODLevel.current = newLODLevel;
      updateLODLevel(newLODLevel);
    }
  });

  const updateLODLevel = (levelIndex: number) => {
    if (!groupRef.current) return;

    const level = lodLevels[levelIndex];
    
    // Traverse all meshes in the group and apply LOD settings
    groupRef.current.traverse((child) => {
      if (child instanceof Mesh) {
        // Update geometry scale
        child.scale.setScalar(level.geometryScale);
        
        // Update material properties
        if (child.material) {
          const material = Array.isArray(child.material) ? child.material[0] : child.material;
          
          // Adjust texture resolution (simplified approach)
          if ('map' in material && material.map) {
            const originalSize = material.map.image?.width || 1024;
            const targetSize = Math.max(256, originalSize * level.textureScale);
            
            // This is a simplified approach - in a real implementation,
            // you'd have pre-generated textures at different resolutions
            material.map.generateMipmaps = level.quality !== 'low';
          }
          
          // Disable shadows if needed
          if ('castShadow' in child) {
            child.castShadow = level.shadowsEnabled;
          }
          if ('receiveShadow' in child) {
            child.receiveShadow = level.shadowsEnabled;
          }
        }
      }
    });

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`LOD Level changed to: ${level.quality} (distance: ${level.distance})`);
    }
  };

  // Initialize LOD system
  useEffect(() => {
    if (enabled && groupRef.current) {
      updateLODLevel(0); // Start with highest quality
    }
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <group ref={groupRef}>
      {children}
      
      {/* LOD Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <LODDebugInfo 
          currentLevel={currentLODLevel.current}
          levels={lodLevels}
          cameraDistance={cameraPosition.current.distanceTo(new Vector3(0, 0, 0))}
        />
      )}
    </group>
  );
}

// Debug component for development
function LODDebugInfo({ 
  currentLevel, 
  levels, 
  cameraDistance 
}: { 
  currentLevel: number; 
  levels: LODLevel[]; 
  cameraDistance: number;
}) {
  return (
    <mesh position={[0, 5, 0]}>
      <planeGeometry args={[2, 1]} />
      <meshBasicMaterial 
        color="black" 
        transparent 
        opacity={0.7} 
      />
      {/* In a real implementation, you'd render text here showing:
          - Current LOD level
          - Camera distance
          - Performance metrics
      */}
    </mesh>
  );
}

// Hook for manual LOD control
export function useLODControl() {
  const capabilities = useDeviceCapabilities();
  
  const shouldUseLOD = useMemo(() => {
    return (
      capabilities.isMobile ||
      capabilities.memoryLimit < 1024 ||
      capabilities.connectionSpeed === 'slow' ||
      !capabilities.webglSupport
    );
  }, [capabilities]);

  const getOptimalSettings = useMemo(() => {
    return {
      maxDistance: capabilities.isMobile ? 10 : 15,
      levels: capabilities.isMobile ? 2 : 3,
      enableShadows: !capabilities.isMobile && capabilities.memoryLimit > 2048,
      textureQuality: capabilities.isMobile ? 0.5 : 1,
      geometryQuality: capabilities.isMobile ? 0.7 : 1
    };
  }, [capabilities]);

  return {
    shouldUseLOD,
    settings: getOptimalSettings,
    capabilities
  };
}