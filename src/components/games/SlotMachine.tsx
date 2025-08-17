'use client';

import { useState } from 'react';
import GameTable from './GameTable';
import { GameTableProps } from '@/lib/types';
import { SlotReelSpin } from '@/components/animations/GameAnimations';

export default function SlotMachine(props: GameTableProps) {
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
    <GameTable {...props} tableColor="#c41e3a" baseColor="#8b0000" onClick={handleTableClick}>
      {/* Slot Machine Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.8, 0.8]} />
        <meshStandardMaterial 
          color="#c41e3a" // Classic red slot machine
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Screen/Reel Area */}
      <mesh position={[0, 0.7, 0.41]} receiveShadow>
        <boxGeometry args={[0.9, 0.6, 0.05]} />
        <meshStandardMaterial 
          color="#000000" // Black screen
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Individual Reel Windows */}
      {[-0.25, 0, 0.25].map((x, index) => (
        <mesh key={index} position={[x, 0.7, 0.42]} receiveShadow>
          <boxGeometry args={[0.2, 0.5, 0.02]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.1}
            metalness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Slot Reel Animation */}
      <SlotReelSpin 
        isActive={isAnimating} 
        onComplete={handleAnimationComplete}
      />

      {/* Coin Slot */}
      <mesh position={[0.4, 1.2, 0.41]} castShadow>
        <boxGeometry args={[0.15, 0.03, 0.05]} />
        <meshStandardMaterial 
          color="#000000"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Handle/Lever */}
      <group position={[0.7, 0.8, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial 
            color="#c0c0c0" // Silver
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Handle Grip */}
        <mesh position={[0, -0.25, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color="#8b4513" // Wood grip
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* Coin Tray */}
      <mesh position={[0, -0.3, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.1, 0.3]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Decorative Lights */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const radius = 0.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh key={i} position={[x, 1.4, z]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial 
              color="#ffd700" // Gold lights
              roughness={0.1}
              metalness={0.9}
              emissive="#ffaa00"
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}

      {/* Top Crown/Sign */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.4, 0.3, 0.1]} />
        <meshStandardMaterial 
          color="#ffd700"
          roughness={0.2}
          metalness={0.8}
          emissive="#ffaa00"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Base Platform */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
        <meshStandardMaterial 
          color="#8b0000" // Dark red base
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>
    </GameTable>
  );
}