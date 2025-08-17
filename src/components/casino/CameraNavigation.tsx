'use client';

import { useState, useEffect } from 'react';
import { useCameraController, CAMERA_POSITIONS } from '@/lib/hooks/useCameraController';
import { GAMES } from '@/lib/data/games';

interface CameraNavigationProps {
  className?: string;
  onNavigate?: (gameId: string) => void;
}

export default function CameraNavigation({ className = '', onNavigate }: CameraNavigationProps) {
  const { navigateToGame, navigateToPosition, isTransitioning } = useCameraController();
  const [currentView, setCurrentView] = useState<string>('default');
  const [isVisible, setIsVisible] = useState(true);

  const handleGameNavigation = (gameId: string) => {
    if (isTransitioning()) return; // Prevent navigation during transitions
    
    const timeline = navigateToGame(gameId);
    if (timeline) {
      setCurrentView(gameId);
      if (onNavigate) {
        onNavigate(gameId);
      }
    }
  };

  const handlePositionNavigation = (positionKey: keyof typeof CAMERA_POSITIONS) => {
    if (isTransitioning()) return;
    
    const timeline = navigateToPosition(positionKey);
    if (timeline) {
      setCurrentView(positionKey);
    }
  };

  // Auto-hide navigation during transitions
  useEffect(() => {
    const checkTransition = () => {
      setIsVisible(!isTransitioning());
    };

    const interval = setInterval(checkTransition, 100);
    return () => clearInterval(interval);
  }, [isTransitioning]);

  return (
    <div className={`fixed top-1/2 right-4 transform -translate-y-1/2 z-10 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-50 pointer-events-none'
    } ${className}`}>
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
        <h3 className="text-white font-semibold mb-3 text-sm">Navigate Casino</h3>
        
        {/* Quick navigation buttons */}
        <div className="space-y-2 mb-4">
          <button
            onClick={() => handlePositionNavigation('default')}
            className={`w-full px-3 py-2 rounded text-sm transition-colors ${
              currentView === 'default'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            disabled={isTransitioning()}
          >
            🏠 Main Floor
          </button>
          
          <button
            onClick={() => handlePositionNavigation('overview')}
            className={`w-full px-3 py-2 rounded text-sm transition-colors ${
              currentView === 'overview'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            disabled={isTransitioning()}
          >
            👁️ Overview
          </button>
        </div>

        {/* Game table navigation */}
        <div className="border-t border-gray-600 pt-3">
          <h4 className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Game Tables</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameNavigation(game.id)}
                className={`w-full px-3 py-2 rounded text-sm text-left transition-colors ${
                  currentView === game.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={isTransitioning()}
              >
                <div className="flex items-center justify-between">
                  <span>{game.displayName}</span>
                  <span className="text-xs opacity-70">
                    {getGameIcon(game.id)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Status indicator */}
        {isTransitioning() && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center text-yellow-400 text-xs">
              <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full mr-2"></div>
              Navigating...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get game icons
function getGameIcon(gameId: string): string {
  const icons: Record<string, string> = {
    'blackjack': '🃏',
    'three-card-poker': '🎰',
    'roulette': '🎡',
    'slots': '🎰',
    'craps': '🎲',
    'higher-or-lower': '📈',
    'horse-racing': '🐎'
  };
  
  return icons[gameId] || '🎮';
}