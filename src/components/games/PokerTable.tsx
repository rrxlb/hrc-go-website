'use client';

import GameTable from './GameTable';
import { GameTableProps } from '@/lib/types';

export default function PokerTable(props: GameTableProps) {
  return (
    <GameTable {...props} feltColor="#0f5132">
      {/* Poker Table Top - Oval/Racetrack shape */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.1, 32]} />
        <meshStandardMaterial 
          color="#0f5132" // Casino green felt
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Inner playing area - slightly raised */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.06, 32]} />
        <meshStandardMaterial 
          color="#0a3d26" // Darker green for playing area
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Table Edge - Wood trim */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[2.25, 2.25, 0.15, 32]} />
        <meshStandardMaterial 
          color="#8b4513" // Wood brown
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Player Positions - Betting areas */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 6;
        const radius = 1.6;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={i} position={[x, 0.03, z]}>
            {/* Betting Circle */}
            <mesh receiveShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.01, 16]} />
              <meshStandardMaterial 
                color="#ffd700" // Gold betting circle
                roughness={0.3}
                metalness={0.7}
                transparent
                opacity={0.8}
              />
            </mesh>
            
            {/* Card area marker */}
            <mesh position={[0, 0.01, -0.3]} receiveShadow>
              <boxGeometry args={[0.15, 0.01, 0.2]} />
              <meshStandardMaterial 
                color="#ffffff"
                roughness={0.2}
                metalness={0.1}
                transparent
                opacity={0.7}
              />
            </mesh>
          </group>
        );
      })}

      {/* Dealer Position */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.01, 16]} />
        <meshStandardMaterial 
          color="#ff6b6b" // Red dealer button area
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Community Card Area (for games like Hold'em) */}
      <mesh position={[0, 0.03, -0.8]} receiveShadow>
        <boxGeometry args={[1.0, 0.01, 0.3]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </GameTable>
  );
}