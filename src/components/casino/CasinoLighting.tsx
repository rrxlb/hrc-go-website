'use client';

import { useRef } from 'react';
import { DirectionalLight } from 'three';
import { useFrame } from '@react-three/fiber';

export default function CasinoLighting() {
  const directionalLightRef = useRef<DirectionalLight>(null);

  // Subtle light animation to simulate casino atmosphere
  useFrame((state) => {
    if (directionalLightRef.current) {
      // Gentle intensity variation to simulate casino lighting
      directionalLightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <>
      {/* Ambient light for overall scene illumination */}
      <ambientLight 
        intensity={0.3} 
        color="#ffd700" // Warm golden casino lighting
      />
      
      {/* Main directional light simulating overhead casino lights */}
      <directionalLight
        ref={directionalLightRef}
        position={[5, 10, 5]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Secondary directional light for fill lighting */}
      <directionalLight
        position={[-5, 8, -5]}
        intensity={0.4}
        color="#ff6b35" // Warm orange accent light
      />
      
      {/* Point lights to simulate table lamps */}
      <pointLight
        position={[0, 3, 0]}
        intensity={0.6}
        color="#ffd700"
        distance={8}
        decay={2}
      />
      
      <pointLight
        position={[4, 2.5, 4]}
        intensity={0.4}
        color="#ff6b35"
        distance={6}
        decay={2}
      />
      
      <pointLight
        position={[-4, 2.5, -4]}
        intensity={0.4}
        color="#ff6b35"
        distance={6}
        decay={2}
      />
    </>
  );
}