'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameConfig } from '@/lib/types';

interface ResponsiveNavigationProps {
  games: GameConfig[];
  selectedGame: GameConfig | null;
  onGameSelect: (gameId: string) => void;
  onDiscordClick: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export default function ResponsiveNavigation({
  games,
  selectedGame,
  onGameSelect,
  onDiscordClick,
  isMenuOpen,
  onToggleMenu,
}: ResponsiveNavigationProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const handleGameSelect = (game: GameConfig) => {
    onGameSelect(game.id);
    if (screenSize === 'mobile') {
      onToggleMenu();
    }
  };

  // Mobile Navigation
  if (screenSize === 'mobile') {
    return (
      <>
        {/* Mobile Menu Button */}
        <motion.button
          onClick={onToggleMenu}
          className="fixed top-4 right-4 z-50 bg-casino-black/90 backdrop-blur-sm border border-casino-gold/30 rounded-full p-3 text-casino-gold shadow-casino-glow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isMenuOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.div>
        </motion.button>

        {/* Mobile Full Screen Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-casino-black/95 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col h-full pt-20 px-6">
                <motion.h2
                  className="text-2xl font-bold text-casino-gold mb-6 text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Choose Your Game
                </motion.h2>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {games.map((game, index) => (
                    <motion.button
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                        selectedGame?.id === game.id
                          ? 'bg-casino-gold/20 border-casino-gold/60 text-casino-gold'
                          : 'bg-casino-black/50 border-casino-gold/20 text-casino-white'
                      }`}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{game.displayName}</h3>
                        <p className="text-sm opacity-70 mt-1">{game.description}</p>
                        <div className="text-sm text-casino-gold/80 mt-2">
                          {game.discordCommand}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={onDiscordClick}
                  className="w-full bg-casino-gold-gradient text-casino-black font-bold py-4 px-6 rounded-xl shadow-casino-glow mt-6 mb-6"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🎰 Join Discord Server
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Tablet Navigation
  if (screenSize === 'tablet') {
    return (
      <>
        {/* Tablet Menu Button */}
        <motion.button
          onClick={onToggleMenu}
          className="fixed top-6 right-6 z-50 bg-casino-black/90 backdrop-blur-sm border border-casino-gold/30 rounded-full p-4 text-casino-gold shadow-casino-glow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isMenuOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.div>
        </motion.button>

        {/* Tablet Side Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="fixed top-20 right-6 z-40 w-80"
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-casino-black/90 backdrop-blur-md border border-casino-gold/30 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-casino-gold font-bold text-xl mb-4 text-center">
                  Game Selection
                </h3>
                
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {games.map((game, index) => (
                    <motion.button
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-300 ${
                        selectedGame?.id === game.id
                          ? 'bg-casino-gold/20 border-casino-gold/60 text-casino-gold'
                          : 'bg-casino-black/50 border-casino-gold/20 text-casino-white hover:border-casino-gold/40'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h4 className="font-semibold">{game.displayName}</h4>
                      <p className="text-sm opacity-70 mt-1">{game.description}</p>
                      <div className="text-sm text-casino-gold/80 mt-1">
                        {game.discordCommand}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={onDiscordClick}
                  className="w-full mt-4 bg-casino-gold-gradient text-casino-black font-bold py-3 px-4 rounded-lg shadow-casino-glow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🎰 Join Discord
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Navigation (default)
  return (
    <>
      {/* Desktop Menu Button */}
      <motion.button
        onClick={onToggleMenu}
        className="fixed top-6 right-6 z-50 bg-casino-black/80 backdrop-blur-sm border border-casino-gold/30 rounded-full p-4 text-casino-gold hover:border-casino-gold/60 hover:bg-casino-black/90 transition-all duration-300 shadow-casino-glow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isMenuOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </motion.div>
      </motion.button>

      {/* Desktop Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-20 right-6 z-40"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-casino-black/90 backdrop-blur-md border border-casino-gold/30 rounded-2xl p-6 shadow-2xl w-96">
              <h3 className="text-casino-gold font-bold text-xl mb-4 text-center">
                Choose Your Game
              </h3>
              
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                {games.map((game, index) => (
                  <motion.button
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    className={`text-left p-4 rounded-lg border transition-all duration-300 ${
                      selectedGame?.id === game.id
                        ? 'bg-casino-gold/20 border-casino-gold/60 text-casino-gold'
                        : 'bg-casino-black/50 border-casino-gold/20 text-casino-white hover:border-casino-gold/40 hover:bg-casino-gold/10'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{game.displayName}</h4>
                        <p className="text-sm opacity-70 mt-1">{game.description}</p>
                        <div className="text-sm text-casino-gold/80 mt-2">
                          {game.discordCommand}
                        </div>
                      </div>
                      <div className="text-casino-gold/60 ml-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={onDiscordClick}
                className="w-full mt-6 bg-casino-gold-gradient text-casino-black font-bold py-3 px-6 rounded-lg shadow-casino-glow hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎰 Join Discord Server
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}