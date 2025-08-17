'use client';

import { useState, useEffect } from 'react';
import { GAMES } from '@/lib/data/games';
import { useTableInteractions } from '@/lib/hooks/useTableInteractions';
import {
  BlackjackTable,
  RouletteTable,
  PokerTable,
  CrapsTable,
  SlotMachine,
  CardTable,
  RacingBooth
} from '@/components/games';

// Map game IDs to their respective components
const GAME_COMPONENTS = {
  'blackjack': BlackjackTable,
  'three-card-poker': PokerTable,
  'roulette': RouletteTable,
  'slots': SlotMachine,
  'craps': CrapsTable,
  'higher-or-lower': CardTable,
  'horse-racing': RacingBooth
} as const;

// Define table positions in a circular arrangement around the casino floor
const TABLE_POSITIONS: Record<string, [number, number, number]> = {
  'blackjack': [-4, 0, 2] as [number, number, number],
  'three-card-poker': [-2, 0, 4] as [number, number, number],
  'roulette': [2, 0, 4] as [number, number, number],
  'slots': [4, 0, 2] as [number, number, number],
  'craps': [4, 0, -2] as [number, number, number],
  'higher-or-lower': [2, 0, -4] as [number, number, number],
  'horse-racing': [-2, 0, -4] as [number, number, number]
};

// Define table rotations to face toward the center
const TABLE_ROTATIONS: Record<string, [number, number, number]> = {
  'blackjack': [0, Math.PI / 4, 0] as [number, number, number],
  'three-card-poker': [0, Math.PI / 6, 0] as [number, number, number],
  'roulette': [0, -Math.PI / 6, 0] as [number, number, number],
  'slots': [0, -Math.PI / 4, 0] as [number, number, number],
  'craps': [0, -3 * Math.PI / 4, 0] as [number, number, number],
  'higher-or-lower': [0, 3 * Math.PI / 4, 0] as [number, number, number],
  'horse-racing': [0, 5 * Math.PI / 6, 0] as [number, number, number]
};

interface GameTablesLayoutProps {
  onTableHover?: (gameId: string | null, hovered: boolean) => void;
  onTableClick?: (gameId: string) => void;
}

export default function GameTablesLayout({
  onTableHover,
  onTableClick
}: GameTablesLayoutProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [clickedTable, setClickedTable] = useState<string | null>(null);

  // Enhanced interaction system with raycasting
  const {
    hoveredTable: raycastHoveredTable,
    clickedTable: raycastClickedTable,
    setupEventListeners
  } = useTableInteractions({
    onTableHover: (gameId, hovered) => {
      setHoveredTable(hovered ? gameId : null);
      onTableHover?.(gameId, hovered);
    },
    onTableClick: (gameId) => {
      setClickedTable(gameId);
      onTableClick?.(gameId);
      // Reset clicked state after animation
      setTimeout(() => setClickedTable(null), 300);
    }
  });

  // Set up event listeners for raycasting
  useEffect(() => {
    const cleanup = setupEventListeners();
    return cleanup;
  }, [setupEventListeners]);

  const handleTableHover = (gameId: string) => (hovered: boolean) => {
    // This handles the fallback pointer events
    if (!raycastHoveredTable) {
      setHoveredTable(hovered ? gameId : null);
      onTableHover?.(hovered ? gameId : null, hovered);
    }
  };

  const handleTableClick = (gameId: string) => () => {
    // This handles the fallback pointer events
    if (!raycastClickedTable) {
      setClickedTable(gameId);
      onTableClick?.(gameId);
      setTimeout(() => setClickedTable(null), 300);
    }
  };

  return (
    <group>
      {GAMES.map((game) => {
        const TableComponent = GAME_COMPONENTS[game.id as keyof typeof GAME_COMPONENTS];
        const position = TABLE_POSITIONS[game.id] || ([0, 0, 0] as [number, number, number]);
        const rotation = TABLE_ROTATIONS[game.id] || ([0, 0, 0] as [number, number, number]);

        if (!TableComponent) {
          console.warn(`No component found for game: ${game.id}`);
          return null;
        }

        const isHovered = hoveredTable === game.id || raycastHoveredTable === game.id;
        const isClicked = clickedTable === game.id || raycastClickedTable === game.id;

        return (
          <TableComponent
            key={game.id}
            gameId={game.id}
            position={position}
            rotation={rotation}
            onHover={handleTableHover(game.id)}
            onClick={handleTableClick(game.id)}
            isHovered={isHovered}
            isClicked={isClicked}
          />
        );
      })}
    </group>
  );
}