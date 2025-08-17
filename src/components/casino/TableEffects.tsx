'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, RingGeometry, MeshBasicMaterial } from 'three';
import { gsap } from 'gsap';

interface TableEffectsProps {
  position: [number, number, number];
  isHovered: boolean;
  isClicked: boolean;
  glowColor?: string;
  pulseColor?: string;
}

export default function TableEffects({
  position,
  isHovered,
  isClicked,
  glowColor = '#ffd700', // Gold
  pulseColor = '#ff6b35'  // Orange-red
}: TableEffectsProps) {
  const glowRef = useRef<Mesh>(null);
  const pulseRef = useRef<Mesh>(null);
  const rippleRef = useRef<Mesh>(null);
  
  // Create geometries and materials
  const glowGeometry = useMemo(() => new RingGeometry(1.8, 2.2, 32), []);
  const pulseGeometry = useMemo(() => new RingGeometry(1.5, 1.8, 32), []);
  const rippleGeometry = useMemo(() => new RingGeometry(0.5, 3.0, 32), []);
  
  const glowMaterial = useMemo(() => new MeshBasicMaterial({
    color: new Color(glowColor),
    transparent: true,
    opacity: 0
  }), [glowColor]);
  
  const pulseMaterial = useMemo(() => new MeshBasicMaterial({
    color: new Color(pulseColor),
    transparent: true,
    opacity: 0
  }), [pulseColor]);
  
  const rippleMaterial = useMemo(() => new MeshBasicMaterial({
    color: new Color('#ffffff'),
    transparent: true,
    opacity: 0
  }), []);

  // Animate glow effect on hover
  useFrame((state) => {
    if (glowRef.current && pulseRef.current) {
      if (isHovered) {
        // Smooth glow fade in
        glowMaterial.opacity = Math.min(glowMaterial.opacity + 0.05, 0.4);
        
        // Pulsing effect
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.2;
        pulseMaterial.opacity = pulse;
        
        // Subtle rotation
        glowRef.current.rotation.z += 0.01;
        pulseRef.current.rotation.z -= 0.015;
      } else {
        // Smooth glow fade out
        glowMaterial.opacity = Math.max(glowMaterial.opacity - 0.03, 0);
        pulseMaterial.opacity = Math.max(pulseMaterial.opacity - 0.05, 0);
      }
    }
  });

  // Click ripple effect
  useFrame(() => {
    if (isClicked && rippleRef.current) {
      // Create expanding ripple effect
      gsap.fromTo(rippleRef.current.scale, 
        { x: 0.1, y: 0.1, z: 0.1 },
        { 
          x: 2, 
          y: 2, 
          z: 2, 
          duration: 0.6, 
          ease: "power2.out" 
        }
      );
      
      gsap.fromTo(rippleMaterial, 
        { opacity: 0.8 },
        { 
          opacity: 0, 
          duration: 0.6, 
          ease: "power2.out" 
        }
      );
    }
  });

  return (
    <group position={position}>
      {/* Hover glow ring */}
      <mesh 
        ref={glowRef}
        geometry={glowGeometry}
        material={glowMaterial}
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      
      {/* Pulsing inner ring */}
      <mesh 
        ref={pulseRef}
        geometry={pulseGeometry}
        material={pulseMaterial}
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      
      {/* Click ripple effect */}
      <mesh 
        ref={rippleRef}
        geometry={rippleGeometry}
        material={rippleMaterial}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}