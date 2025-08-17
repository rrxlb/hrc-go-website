/**
 * Enhanced GameTable component with integrated analytics tracking
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameAnalytics } from '@/lib/hooks/useGameAnalytics';
import { useConversionTracking } from '@/lib/hooks/useConversionTracking';
import GameTable from '@/components/games/GameTable';
import { GameConfig } from '@/lib/data/games';

interface AnalyticsGameTableProps {
  game: GameConfig;
  position: [number, number, number];
  onHover?: (gameId: string) => void;
  onClick?: (gameId: string) => void;
  children?: React.ReactNode;
}

export function AnalyticsGameTable({ 
  game, 
  position, 
  onHover, 
  onClick, 
  children 
}: AnalyticsGameTableProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const hoverTimeRef = useRef<number | null>(null);
  const viewTimeRef = useRef<number | null>(null);
  const isInViewRef = useRef(false);

  const gameAnalytics = useGameAnalytics({
    gameId: game.id,
    gameType: game.name
  });

  const conversionTracking = useConversionTracking({
    source: 'game_table',
    gameContext: game.id
  });

  // Track when table comes into view
  useFrame((state) => {
    if (!meshRef.current) return;

    const camera = state.camera;
    const tablePosition = meshRef.current.position;
    const distance = camera.position.distanceTo(tablePosition);
    const isCurrentlyInView = distance < 15; // Adjust threshold as needed

    // Track view start
    if (isCurrentlyInView && !isInViewRef.current) {
      isInViewRef.current = true;
      viewTimeRef.current = Date.now();
      gameAnalytics.trackGameView([
        camera.position.x,
        camera.position.y,
        camera.position.z
      ]);
    }

    // Track view end
    if (!isCurrentlyInView && isInViewRef.current) {
      isInViewRef.current = false;
      if (viewTimeRef.current) {
        const viewDuration = Date.now() - viewTimeRef.current;
        gameAnalytics.trackGameEngagement('view_duration', viewDuration);
        viewTimeRef.current = null;
      }
      gameAnalytics.trackGameViewEnd();
    }
  });

  const handleHover = (hovered: boolean) => {
    if (hovered) {
      hoverTimeRef.current = Date.now();
      
      // Get default camera position for context
      const cameraPosition: [number, number, number] = [0, 1.5, 2];

      gameAnalytics.trackGameHover(cameraPosition);
      onHover?.(game.id);
    } else {
      if (hoverTimeRef.current) {
        const hoverDuration = Date.now() - hoverTimeRef.current;
        gameAnalytics.trackGameEngagement('hover_duration', hoverDuration);
        hoverTimeRef.current = null;
      }
    }
  };

  const handleClick = () => {
    // Get default camera position for context
    const cameraPosition: [number, number, number] = [0, 1.5, 2];

    gameAnalytics.trackGameClick(cameraPosition);
    
    // Track as potential conversion event
    conversionTracking.trackConversionFunnel('interest', {
      interactionType: 'table_click',
      gameId: game.id
    });

    onClick?.(game.id);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isInViewRef.current) {
        gameAnalytics.trackGameViewEnd();
      }
    };
  }, [gameAnalytics]);

  return (
    <GameTable
      gameId={game.id}
      position={position}
      onHover={handleHover}
      onClick={handleClick}
    >
      {children}
    </GameTable>
  );
}