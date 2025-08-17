'use client';

import GameTable from './GameTable';
import { GameTableProps } from '@/lib/types';

export default function CardTable(props: GameTableProps) {
  return (
    <GameTable {...props} feltColor="#0f5132">
      {/* Card Table Top - Rectangular with rounded corners */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.1, 1.6]} />
        <meshStandardMaterial 
          color="#0f5132" // Casino green felt
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Table Edge - Wood trim */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.5, 0.15, 1.7]} />
        <meshStandardMaterial 
          color="#8b4513" // Wood brown
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Card Display Area */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.01, 0.6]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Higher Button Area */}
      <mesh position={[-0.8, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.01, 0.3]} />
        <meshStandardMaterial 
          color="#4CAF50" // Green for higher
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Lower Button Area */}
      <mesh position={[0.8, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.01, 0.3]} />
        <meshStandardMaterial 
          color="#f44336" // Red for lower
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Betting Area */}
      <mesh position={[0, 0.06, 0.6]} receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.01, 16]} />
        <meshStandardMaterial 
          color="#ffd700" // Gold betting circle
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Multiplier Display Area */}
      <mesh position={[0, 0.06, -0.6]} receiveShadow>
        <boxGeometry args={[1.0, 0.01, 0.3]} />
        <meshStandardMaterial 
          color="#9C27B0" // Purple for multiplier
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Decorative Card Symbols */}
      {[
        { pos: [-1.0, 0.07, -0.6] as [number, number, number], color: "#ff0000" }, // Heart
        { pos: [-0.5, 0.07, -0.6] as [number, number, number], color: "#000000" }, // Spade
        { pos: [0.5, 0.07, -0.6] as [number, number, number], color: "#ff0000" },  // Diamond
        { pos: [1.0, 0.07, -0.6] as [number, number, number], color: "#000000" }   // Club
      ].map((symbol, index) => (
        <mesh key={index} position={symbol.pos} receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.01, 8]} />
          <meshStandardMaterial 
            color={symbol.color}
            roughness={0.2}
            metalness={0.1}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Cash Out Button Area */}
      <mesh position={[0, 0.06, -0.2]} receiveShadow>
        <boxGeometry args={[0.6, 0.01, 0.2]} />
        <meshStandardMaterial 
          color="#FF9800" // Orange for cash out
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </GameTable>
  );
}