'use client';

import { useState } from 'react';
import GameTable from './GameTable';
import { GameTableProps } from '@/lib/types';
import { BlackjackCardDealing } from '@/components/animations/GameAnimations';

export default function BlackjackTable(props: GameTableProps) {
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
      {/* Blackjack Table Top - Semi-circular */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial 
          color="#0f5132" // Casino green felt
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Dealer Area - Straight edge */}
      <mesh position={[0, 0.05, -1.8]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.1, 0.4]} />
        <meshStandardMaterial 
          color="#0f5132"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Table Edge - Wood trim */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1.85, 1.85, 0.15, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial 
          color="#8b4513" // Wood brown
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Dealer Edge Trim */}
      <mesh position={[0, 0.05, -1.8]} castShadow>
        <boxGeometry args={[3.7, 0.15, 0.5]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Player Betting Circles (visual markers) */}
      {[-1.2, 0, 1.2].map((x, index) => (
        <mesh key={index} position={[x, 0.06, 0.8]} receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.01, 16]} />
          <meshStandardMaterial 
            color="#ffd700" // Gold betting circle
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Card dealing area marker */}
      <mesh position={[0, 0.06, -0.8]} receiveShadow>
        <boxGeometry args={[0.6, 0.01, 0.4]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Card dealing animation */}
      <BlackjackCardDealing 
        isActive={isAnimating} 
        onComplete={handleAnimationComplete}
      />
    </GameTable>
  );
}