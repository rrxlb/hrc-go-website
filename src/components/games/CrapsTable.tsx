'use client';

import { useState } from 'react';
import GameTable from './GameTable';
import { GameTableProps } from '@/lib/types';
import { CrapsDiceRoll } from '@/components/animations/GameAnimations';

export default function CrapsTable(props: GameTableProps) {
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
      {/* Craps Table Top - Long rectangular */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.1, 2.0]} />
        <meshStandardMaterial 
          color="#0f5132" // Casino green felt
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Table Edge - Wood trim */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4.6, 0.15, 2.1]} />
        <meshStandardMaterial 
          color="#8b4513" // Wood brown
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Raised Rails for dice bouncing */}
      <mesh position={[0, 0.2, 0.95]} castShadow>
        <boxGeometry args={[4.5, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[0, 0.2, -0.95]} castShadow>
        <boxGeometry args={[4.5, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[2.2, 0.2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 1.8]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[-2.2, 0.2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 1.8]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Pass Line */}
      <mesh position={[0, 0.06, 0.7]} receiveShadow>
        <boxGeometry args={[4.2, 0.01, 0.15]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Don't Pass Line */}
      <mesh position={[0, 0.06, -0.7]} receiveShadow>
        <boxGeometry args={[4.2, 0.01, 0.15]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Field Betting Area */}
      <mesh position={[0, 0.06, 0.2]} receiveShadow>
        <boxGeometry args={[4.0, 0.01, 0.6]} />
        <meshStandardMaterial 
          color="#ffff99" // Light yellow for field
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Come/Don't Come Areas */}
      <mesh position={[1.5, 0.06, -0.2]} receiveShadow>
        <boxGeometry args={[1.2, 0.01, 0.4]} />
        <meshStandardMaterial 
          color="#ffcccc" // Light red
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh position={[-1.5, 0.06, -0.2]} receiveShadow>
        <boxGeometry args={[1.2, 0.01, 0.4]} />
        <meshStandardMaterial 
          color="#ccccff" // Light blue
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Animated Dice Rolling */}
      <CrapsDiceRoll 
        isActive={isAnimating} 
        onComplete={handleAnimationComplete}
      />

      {/* Static dice when not animating */}
      {!isAnimating && (
        <>
          <mesh position={[0.3, 0.15, 0]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial 
              color="#ffffff"
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>

          <mesh position={[-0.3, 0.15, 0]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial 
              color="#ffffff"
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
        </>
      )}
    </GameTable>
  );
}