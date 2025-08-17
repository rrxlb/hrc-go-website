'use client';

import { useState } from 'react';
import { useCameraController } from '@/lib/hooks/useCameraController';
import { GAMES } from '@/lib/data/games';

export default function CameraDemo() {
  const { navigateToGame, navigateToPosition, isTransitioning } = useCameraController();
  const [currentView, setCurrentView] = useState('default');

  const handleGameNavigation = (gameId: string) => {
    if (!isTransitioning()) {
      navigateToGame(gameId);
      setCurrentView(gameId);
    }
  };

  const handlePositionNavigation = (position: string) => {
    if (!isTransitioning()) {
      navigateToPosition(position);
      setCurrentView(position);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
      <h3 className="text-sm font-semibold mb-3">Camera Demo</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={() => handlePositionNavigation('default')}
          className={`px-3 py-1 rounded text-xs ${
            currentView === 'default' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'
          }`}
          disabled={isTransitioning()}
        >
          Default View
        </button>
        
        <button
          onClick={() => handlePositionNavigation('overview')}
          className={`px-3 py-1 rounded text-xs ml-2 ${
            currentView === 'overview' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'
          }`}
          disabled={isTransitioning()}
        >
          Overview
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-400 mb-1">Game Tables:</p>
        {GAMES.slice(0, 4).map((game) => (
          <button
            key={game.id}
            onClick={() => handleGameNavigation(game.id)}
            className={`block w-full text-left px-2 py-1 rounded text-xs ${
              currentView === game.id ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            disabled={isTransitioning()}
          >
            {game.displayName}
          </button>
        ))}
      </div>

      {isTransitioning() && (
        <div className="mt-2 text-xs text-yellow-400">
          Transitioning...
        </div>
      )}
    </div>
  );
}