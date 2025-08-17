'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { gsap } from 'gsap';
import { GameTableProps } from '@/lib/types';
import TableEffects from '@/components/casino/TableEffects';

interface BaseGameTableProps extends GameTableProps {
  children?: React.ReactNode;
  tableColor?: string;
  baseColor?: string;
  feltColor?: string;
  isHovered?: boolean;
  isClicked?: boolean;
}

export default function GameTable({
  gameId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onHover,
  onClick,
  children,
  tableColor = "#8b4513", // Wood brown
  baseColor = "#654321", // Darker wood
  feltColor = "#0f5132", // Casino green felt
  isHovered = false,
  isClicked = false
}: BaseGameTableProps) {
  const groupRef = useRef<Group>(null);
  const tableBaseRef = useRef<Mesh>(null);
  const [localHovered, setLocalHovered] = useState(false);
  const [localClicked, setLocalClicked] = useState(false);
  
  // Combine external and local hover states
  const hovered = isHovered || localHovered;
  const clicked = isClicked || localClicked;

  // Enhanced hover animation with GSAP
  useEffect(() => {
    if (groupRef.current && position) {
      if (hovered) {
        // Smooth lift animation
        gsap.to(groupRef.current.position, {
          y: position[1] + 0.08,
          duration: 0.3,
          ease: "power2.out"
        });
        
        // Subtle scale increase
        gsap.to(groupRef.current.scale, {
          x: scale[0] * 1.02,
          y: scale[1] * 1.02,
          z: scale[2] * 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        // Return to original position
        gsap.to(groupRef.current.position, {
          y: position[1],
          duration: 0.4,
          ease: "power2.out"
        });
        
        // Return to original scale
        gsap.to(groupRef.current.scale, {
          x: scale[0],
          y: scale[1],
          z: scale[2],
          duration: 0.4,
          ease: "power2.out"
        });
      }
    }
  }, [hovered, position, scale]);

  // Click animation
  useEffect(() => {
    if (clicked && groupRef.current) {
      // Quick bounce effect
      gsap.to(groupRef.current.scale, {
        x: scale[0] * 0.95,
        y: scale[1] * 0.95,
        z: scale[2] * 0.95,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    }
  }, [clicked, scale]);

  // Subtle floating animation when not interacting
  useFrame((state) => {
    if (groupRef.current && !hovered && !clicked) {
      const floatOffset = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.01;
      groupRef.current.position.y = position[1] + floatOffset;
    }
  });

  const handlePointerOver = () => {
    setLocalHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setLocalHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = () => {
    setLocalClicked(true);
    onClick?.();
    setTimeout(() => setLocalClicked(false), 200);
  };

  return (
    <>
      {/* Enhanced visual effects */}
      <TableEffects 
        position={position}
        isHovered={hovered}
        isClicked={clicked}
      />
      
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        userData={{ gameId, isTable: true }}
      >
        {/* Table Base - Common to all tables */}
        <mesh 
          ref={tableBaseRef}
          position={[0, -0.45, 0]} 
          castShadow 
          receiveShadow
          userData={{ gameId, isTable: true }}
        >
          <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
          <meshStandardMaterial 
            color={hovered ? "#a0522d" : baseColor} // Lighter when hovered
            roughness={hovered ? 0.4 : 0.6}
            metalness={hovered ? 0.3 : 0.2}
          />
        </mesh>

        {/* Enhanced lighting for hovered state */}
        {hovered && (
          <pointLight
            position={[0, 2, 0]}
            intensity={0.5}
            color="#ffd700"
            distance={4}
            decay={2}
          />
        )}

        {/* Game-specific table geometry will be passed as children */}
        {children}
      </group>
    </>
  );
}