'use client';

import { useState } from 'react';
import GameTable from './GameTable';
import { GameTableProps } from '@/lib/types';
import { RouletteWheelSpin } from '@/components/animations/GameAnimations';

export default function RouletteTable(props: GameTableProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTableClick = () => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
    props.onClick?.();
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  return (
    <GameTable {...props} feltColor="#0f5132" onClick={handleTableClick}>
      {/* Main Betting Layout - Rectangular */}
      <mesh position={[0, 0, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.1, 2.4]} />
        <meshStandardMaterial 
          color="#0f5132" // Casino green felt
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Wheel Area - Circular */}
      <mesh position={[0, 0, -1.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial 
          color="#0f5132"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Roulette Wheel Base */}
      <group position={[0, 0.15, -1.5]}>
        {/* Outer Wheel Ring */}
        <mesh castShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.2, 32]} />
          <meshStandardMaterial 
            color="#8b4513" // Wood
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>

        {/* Inner Wheel */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
          <meshStandardMaterial 
            color="#2c1810" // Dark wood
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>

        {/* Center Spindle */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
          <meshStandardMaterial 
            color="#c0c0c0" // Silver
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Animated Roulette Wheel */}
        <group position={[0, 0.1, 0]}>
          <RouletteWheelSpin 
            isActive={isAnimating} 
            onComplete={handleAnimationComplete}
          />
        </group>
      </group>

      {/* Table Edge Trim */}
      <mesh position={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[3.3, 0.15, 2.5]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[0, 0, -1.5]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.15, 32]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Betting Grid Lines (visual) */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={`line-${i}`} position={[-1.2 + i * 0.8, 0.06, 0.5]} receiveShadow>
          <boxGeometry args={[0.02, 0.01, 2.4]} />
          <meshStandardMaterial 
            color="#ffffff"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={`row-${i}`} position={[0, 0.06, -0.3 + i * 0.6]} receiveShadow>
          <boxGeometry args={[3.2, 0.01, 0.02]} />
          <meshStandardMaterial 
            color="#ffffff"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </GameTable>
  );
}