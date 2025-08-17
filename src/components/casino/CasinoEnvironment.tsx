'use client';

import { useRef, useState } from 'react';
import { Mesh } from 'three';
import GameTablesLayout from './GameTablesLayout';
import GameInfoDisplay from './GameInfoDisplay';

interface CasinoEnvironmentProps {
  onTableHover?: (gameId: string | null, hovered: boolean) => void;
  onTableClick?: (gameId: string) => void;
}

export default function CasinoEnvironment({
  onTableHover,
  onTableClick
}: CasinoEnvironmentProps) {
  const floorRef = useRef<Mesh>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const handleTableClick = (gameId: string) => {
    setSelectedGameId(gameId);
    onTableClick?.(gameId);
  };

  const handleCloseGameInfo = () => {
    setSelectedGameId(null);
  };

  return (
    <group>
      {/* Casino Floor */}
      <mesh 
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#2d1810" // Dark brown casino carpet color
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Casino Walls */}
      {/* Back Wall */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial 
          color="#1a0f0a" // Dark casino wall color
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial 
          color="#1a0f0a"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Right Wall */}
      <mesh position={[10, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial 
          color="#1a0f0a"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#0f0a08" // Very dark ceiling
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>

      {/* Game Tables Layout */}
      <GameTablesLayout 
        onTableHover={onTableHover}
        onTableClick={handleTableClick}
      />

      {/* Game Information Display */}
      <GameInfoDisplay 
        selectedGameId={selectedGameId}
        onClose={handleCloseGameInfo}
      />

      {/* Additional atmospheric elements */}
      {/* Decorative pillars */}
      <mesh position={[6, 2.5, 6]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[-6, 2.5, 6]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[6, 2.5, -6]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[-6, 2.5, -6]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}