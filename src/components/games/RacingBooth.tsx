'use client';

import GameTable from './GameTable';
import { GameTableProps } from '@/lib/types';

export default function RacingBooth(props: GameTableProps) {
  return (
    <GameTable {...props} tableColor="#654321" baseColor="#4a2c17">
      {/* Betting Booth Counter */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.8, 1.2]} />
        <meshStandardMaterial 
          color="#654321" // Dark wood
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Counter Top */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.1, 1.3]} />
        <meshStandardMaterial 
          color="#8b4513" // Lighter wood top
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>

      {/* Racing Screen */}
      <mesh position={[0, 1.2, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.9, 0.1]} />
        <meshStandardMaterial 
          color="#000000" // Black screen
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Screen Frame */}
      <mesh position={[0, 1.2, -0.51]} castShadow>
        <boxGeometry args={[1.7, 1.0, 0.12]} />
        <meshStandardMaterial 
          color="#c0c0c0" // Silver frame
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Betting Slips Holder */}
      <mesh position={[-0.7, 0.75, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.15, 0.2]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Pens Holder */}
      <mesh position={[0.7, 0.75, 0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Betting Window */}
      <mesh position={[0, 0.5, 0.61]} receiveShadow>
        <boxGeometry args={[0.8, 0.3, 0.02]} />
        <meshStandardMaterial 
          color="#87CEEB" // Sky blue glass
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Horse Track Display (miniature) */}
      <mesh position={[0, 0.76, 0.2]} receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.02, 32]} />
        <meshStandardMaterial 
          color="#8FBC8F" // Track green
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Track Rails */}
      <mesh position={[0, 0.77, 0.2]} receiveShadow>
        <torusGeometry args={[0.35, 0.02, 8, 32]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      <mesh position={[0, 0.77, 0.2]} receiveShadow>
        <torusGeometry args={[0.25, 0.02, 8, 32]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Odds Board */}
      <mesh position={[0, 1.0, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.4, 0.05]} />
        <meshStandardMaterial 
          color="#000000"
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* LED Lights around odds board */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        const radius = 0.75;
        const x = Math.cos(angle) * radius;
        const y = 1.0 + Math.sin(angle) * 0.25;
        
        return (
          <mesh key={i} position={[x, y, 0.41]} castShadow>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color="#ffd700"
              roughness={0.1}
              metalness={0.9}
              emissive="#ffaa00"
              emissiveIntensity={0.4}
            />
          </mesh>
        );
      })}

      {/* Cash Register/Terminal */}
      <mesh position={[0.5, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.2, 0.4]} />
        <meshStandardMaterial 
          color="#2c2c2c" // Dark gray
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </GameTable>
  );
}