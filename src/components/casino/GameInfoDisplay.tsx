'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameConfig } from '@/lib/types';
import { getGameById } from '@/lib/data/games';

interface GameInfoDisplayProps {
  selectedGameId: string | null;
  onClose?: () => void;
}

export default function GameInfoDisplay({ 
  selectedGameId, 
  onClose 
}: GameInfoDisplayProps) {
  const [gameData, setGameData] = useState<GameConfig | null>(null);

  useEffect(() => {
    if (selectedGameId) {
      const game = getGameById(selectedGameId);
      setGameData(game || null);
    } else {
      setGameData(null);
    }
  }, [selectedGameId]);

  if (!gameData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-96 z-50"
      >
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-yellow-500/30 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="p-6 border-b border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-1">
                  {gameData.displayName}
                </h3>
                <p className="text-gray-300 text-sm">
                  {gameData.description}
                </p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Game Features</h4>
            <div className="space-y-3">
              {gameData.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    feature.highlight 
                      ? 'bg-yellow-500/10 border border-yellow-500/20' 
                      : 'bg-gray-800/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    feature.highlight ? 'bg-yellow-400' : 'bg-gray-400'
                  }`} />
                  <div>
                    <h5 className={`font-medium ${
                      feature.highlight ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {feature.title}
                    </h5>
                    <p className="text-gray-300 text-sm mt-1">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Discord CTA */}
          <div className="p-6 border-t border-yellow-500/20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 shadow-lg"
              onClick={() => {
                // This would typically open Discord or copy the command
                console.log(`Try ${gameData.discordCommand} in Discord!`);
              }}
            >
              Try {gameData.discordCommand} in Discord
            </motion.button>
            <p className="text-center text-gray-400 text-xs mt-2">
              Join the High Roller Club to play!
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}