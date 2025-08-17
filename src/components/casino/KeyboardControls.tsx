'use client';

import { useEffect, useCallback } from 'react';
import { useCameraController } from '@/lib/hooks/useCameraController';
import { GAMES } from '@/lib/data/games';

interface KeyboardControlsProps {
  enabled?: boolean;
}

export default function KeyboardControls({ enabled = true }: KeyboardControlsProps) {
  const { navigateToGame, navigateToPosition } = useCameraController();

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Prevent default behavior for our handled keys
    const handledKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'h', 'o', 'Escape'];
    if (handledKeys.includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      // Number keys for game navigation (1-7 for games)
      case '1':
        if (GAMES[0]) navigateToGame(GAMES[0].id);
        break;
      case '2':
        if (GAMES[1]) navigateToGame(GAMES[1].id);
        break;
      case '3':
        if (GAMES[2]) navigateToGame(GAMES[2].id);
        break;
      case '4':
        if (GAMES[3]) navigateToGame(GAMES[3].id);
        break;
      case '5':
        if (GAMES[4]) navigateToGame(GAMES[4].id);
        break;
      case '6':
        if (GAMES[5]) navigateToGame(GAMES[5].id);
        break;
      case '7':
        if (GAMES[6]) navigateToGame(GAMES[6].id);
        break;
      
      // Special navigation keys
      case 'h':
      case 'H':
        // Home - return to default position
        navigateToPosition('default');
        break;
      
      case 'o':
      case 'O':
        // Overview - bird's eye view
        navigateToPosition('overview');
        break;
      
      case 'Escape':
        // Return to default position
        navigateToPosition('default');
        break;
      
      default:
        break;
    }
  }, [enabled, navigateToGame, navigateToPosition]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [enabled, handleKeyPress]);

  return null; // This component doesn't render anything
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-sm ${className}`}>
      <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-yellow-400 text-xs mb-1">Navigation</h4>
            <div className="space-y-1 text-xs">
              <div><kbd className="bg-gray-700 px-1 rounded">H</kbd> Home</div>
              <div><kbd className="bg-gray-700 px-1 rounded">O</kbd> Overview</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> Reset</div>
            </div>
          </div>
          <div>
            <h4 className="text-green-400 text-xs mb-1">Games</h4>
            <div className="space-y-1 text-xs">
              {GAMES.slice(0, 7).map((game, index) => (
                <div key={game.id}>
                  <kbd className="bg-gray-700 px-1 rounded">{index + 1}</kbd> {game.displayName}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}