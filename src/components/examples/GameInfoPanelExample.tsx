'use client';

import { useState } from 'react';
import GameInfoPanel from '@/components/ui/GameInfoPanel';
import { useGameInfoPanel } from '@/lib/hooks/useGameInfoPanel';
import { GAMES } from '@/lib/data/games';

export default function GameInfoPanelExample() {
  const { selectedGame, isVisible, showGameInfo, hideGameInfo, toggleGameInfo } = useGameInfoPanel();
  const [position, setPosition] = useState<'left' | 'right' | 'bottom'>('right');

  return (
    <div className="min-h-screen bg-casino-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-casino-gold mb-8 text-center">
          Game Info Panel Demo
        </h1>

        {/* Position Controls */}
        <div className="mb-8 text-center">
          <h2 className="text-xl text-casino-gold mb-4">Panel Position</h2>
          <div className="flex justify-center gap-4">
            {(['left', 'right', 'bottom'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200 capitalize
                  ${position === pos 
                    ? 'bg-casino-gold text-casino-black border-casino-gold' 
                    : 'bg-casino-black/30 text-casino-gold border-casino-gold/30 hover:border-casino-gold/60'
                  }
                `}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className="bg-casino-black/30 border border-casino-gold/20 rounded-lg p-6 
                         hover:border-casino-gold/40 transition-all duration-300 cursor-pointer
                         hover:shadow-casino-glow"
              onClick={() => showGameInfo(game)}
            >
              <h3 className="text-xl font-bold text-casino-gold mb-2">
                {game.displayName}
              </h3>
              <p className="text-casino-gold/70 text-sm mb-4 line-clamp-2">
                {game.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-casino-gold/60 text-xs">
                  {game.features.length} features
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGameInfo(game);
                  }}
                  className="text-casino-gold hover:text-casino-gold-dark transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => showGameInfo(GAMES[0])}
              className="px-6 py-3 bg-casino-gold-gradient text-casino-black font-semibold 
                         rounded-lg hover:shadow-casino-glow transition-all duration-200"
            >
              Show Blackjack Info
            </button>
            <button
              onClick={() => showGameInfo(GAMES[2])}
              className="px-6 py-3 bg-casino-red-gradient text-white font-semibold 
                         rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Show Roulette Info
            </button>
            <button
              onClick={hideGameInfo}
              className="px-6 py-3 bg-casino-black/50 border border-casino-gold/30 
                         text-casino-gold rounded-lg hover:border-casino-gold/60 
                         transition-all duration-200"
            >
              Hide Panel
            </button>
          </div>

          <div className="text-casino-gold/60 text-sm">
            <p>Click on any game card to open its info panel</p>
            <p>Press Escape or click the backdrop to close</p>
            {selectedGame && (
              <p className="mt-2 text-casino-gold">
                Currently selected: <strong>{selectedGame.displayName}</strong>
                {isVisible ? ' (visible)' : ' (hidden)'}
              </p>
            )}
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mt-12 bg-casino-black/20 rounded-lg p-6 border border-casino-gold/10">
          <h2 className="text-2xl font-bold text-casino-gold mb-4">Features Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-casino-gold/80">
            <div>
              <h3 className="font-semibold text-casino-gold mb-2">✨ Animations</h3>
              <ul className="text-sm space-y-1">
                <li>• Slide-in animations with spring physics</li>
                <li>• Staggered feature card animations</li>
                <li>• Hover effects and micro-interactions</li>
                <li>• Smooth backdrop blur transitions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-casino-gold mb-2">🎮 Interactions</h3>
              <ul className="text-sm space-y-1">
                <li>• Dynamic content loading per game</li>
                <li>• Feature highlighting system</li>
                <li>• Discord CTA integration</li>
                <li>• Keyboard navigation (Escape to close)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-casino-gold mb-2">📱 Responsive</h3>
              <ul className="text-sm space-y-1">
                <li>• Mobile-optimized layouts</li>
                <li>• Touch-friendly interactions</li>
                <li>• Adaptive positioning</li>
                <li>• Flexible panel sizing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-casino-gold mb-2">🎨 Theming</h3>
              <ul className="text-sm space-y-1">
                <li>• Casino-themed color scheme</li>
                <li>• Consistent visual hierarchy</li>
                <li>• Icon system for game features</li>
                <li>• Glassmorphism effects</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Game Info Panel */}
      <GameInfoPanel
        game={selectedGame}
        isVisible={isVisible}
        onClose={hideGameInfo}
        position={position}
      />
    </div>
  );
}