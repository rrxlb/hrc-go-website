'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAMES } from '@/lib/data/games';
import { GameConfig } from '@/lib/types';
import { useAccessibilityContext } from '@/components/accessibility/AccessibilityProvider';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import { useFocusable } from '@/components/accessibility/KeyboardNavigationProvider';

interface NavigationOverlayProps {
  onGameSelect?: (gameId: string) => void;
  onDiscordClick?: () => void;
  className?: string;
}

export default function NavigationOverlay({ 
  onGameSelect, 
  onDiscordClick,
  className = '' 
}: NavigationOverlayProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  
  // Accessibility hooks
  const accessibility = useAccessibilityContext();
  const { containerRef: menuRef } = useKeyboardNavigation({
    enabled: accessibility.keyboardNavigation && isMenuOpen,
    trapFocus: isMenuOpen,
    onEscape: () => setIsMenuOpen(false)
  });
  
  const { elementRef: toggleButtonRef, isFocused: isToggleFocused } = useFocusable('nav-toggle', 100);
  const { elementRef: discordButtonRef, isFocused: isDiscordFocused } = useFocusable('discord-cta', 90);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);
      
      // Update screen size classification with better mobile detection
      if (width < 475) setScreenSize('xs');
      else if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else setScreenSize('xl');
      
      // Adjust for mobile viewport height issues
      if (width < 768) {
        const vh = height * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkMobile, 100); // Delay to get accurate dimensions after rotation
    });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const handleGameSelect = (game: GameConfig) => {
    setSelectedGame(game);
    onGameSelect?.(game.id);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const handleDiscordClick = () => {
    onDiscordClick?.();
    // Open Discord invite in new tab
    window.open('https://discord.gg/RK4K8tDsHB', '_blank');
  };

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {/* Main Navigation Button */}
      <motion.div
        className={`absolute pointer-events-auto ${
          isMobile ? 'top-4 right-4' : 'top-6 right-6'
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          ref={toggleButtonRef as React.RefObject<HTMLButtonElement>}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`
            bg-casino-black/80 backdrop-blur-sm border border-casino-gold/30 rounded-full 
            text-casino-gold hover:border-casino-gold/60 hover:bg-casino-black/90 
            transition-all duration-300 shadow-casino-glow
            focus:outline-none focus:ring-2 focus:ring-casino-gold/50 focus:ring-offset-2 focus:ring-offset-casino-black
            ${isMobile ? 'p-3 min-h-[48px] min-w-[48px]' : 'p-4'}
            ${isToggleFocused ? 'ring-2 ring-casino-gold/50 ring-offset-2 ring-offset-casino-black' : ''}
          `}
          whileHover={!accessibility.reduceMotion ? { scale: 1.05 } : {}}
          whileTap={!accessibility.reduceMotion ? { scale: 0.95 } : {}}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="navigation-menu"
          aria-haspopup="true"
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
              <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Discord CTA Button - Always Visible */}
      <motion.div
        className={`absolute pointer-events-auto ${
          isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'
        }`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          ref={discordButtonRef as React.RefObject<HTMLButtonElement>}
          onClick={handleDiscordClick}
          className={`
            bg-casino-gold-gradient text-casino-black font-bold rounded-full 
            shadow-casino-glow hover:shadow-lg transition-all duration-300 
            flex items-center gap-2 min-h-[48px]
            focus:outline-none focus:ring-2 focus:ring-casino-gold/50 focus:ring-offset-2 focus:ring-offset-casino-black
            ${isMobile ? 'py-2 px-4 text-sm' : 'py-3 px-6 text-base'}
            ${isDiscordFocused ? 'ring-2 ring-casino-gold/50 ring-offset-2 ring-offset-casino-black' : ''}
          `}
          whileHover={!accessibility.reduceMotion ? { scale: 1.05, boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' } : {}}
          whileTap={!accessibility.reduceMotion ? { scale: 0.95 } : {}}
          aria-label="Join Discord server"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Join Discord
        </motion.button>
      </motion.div>

      {/* Game Selection Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef as React.RefObject<HTMLDivElement>}
            id="navigation-menu"
            className={`
              absolute pointer-events-auto
              ${isMobile 
                ? 'top-16 left-4 right-4' 
                : 'top-20 right-6 max-w-sm w-80'
              }
            `}
            initial={!accessibility.reduceMotion ? { opacity: 0, scale: 0.8, y: -20 } : { opacity: 0 }}
            animate={!accessibility.reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1 }}
            exit={!accessibility.reduceMotion ? { opacity: 0, scale: 0.8, y: -20 } : { opacity: 0 }}
            transition={!accessibility.reduceMotion ? { duration: 0.3, ease: "easeOut" } : { duration: 0.1 }}
            role="menu"
            aria-labelledby="nav-toggle"
          >
            <div className={`
              bg-casino-black/90 backdrop-blur-md border border-casino-gold/30 
              rounded-2xl shadow-2xl
              ${isMobile ? 'p-4' : 'p-6'}
            `}>
              <h3 className="text-casino-gold font-bold text-lg mb-4 text-center">
                Choose Your Game
              </h3>
              
              <div className={`
                space-y-2 overflow-y-auto custom-scrollbar
                ${isMobile ? 'max-h-64' : 'max-h-96'}
              `}>
                {GAMES.map((game, index) => (
                  <motion.button
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    className={`
                      w-full text-left rounded-lg border transition-all duration-300 
                      min-h-[48px] flex items-center
                      focus:outline-none focus:ring-2 focus:ring-casino-gold/50 focus:ring-offset-2 focus:ring-offset-casino-black
                      ${isMobile ? 'p-2' : 'p-3'}
                      ${selectedGame?.id === game.id
                        ? 'bg-casino-gold/20 border-casino-gold/60 text-casino-gold'
                        : 'bg-casino-black/50 border-casino-gold/20 text-casino-white hover:border-casino-gold/40 hover:bg-casino-gold/10'
                      }
                    `}
                    initial={!accessibility.reduceMotion ? { opacity: 0, x: 20 } : { opacity: 0 }}
                    animate={!accessibility.reduceMotion ? { opacity: 1, x: 0 } : { opacity: 1 }}
                    transition={!accessibility.reduceMotion ? { delay: index * 0.05 } : { duration: 0.1 }}
                    whileHover={!accessibility.reduceMotion ? { scale: 1.02 } : {}}
                    whileTap={!accessibility.reduceMotion ? { scale: 0.98 } : {}}
                    role="menuitem"
                    aria-label={`Select ${game.displayName} game`}
                    aria-describedby={`game-${game.id}-description`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {game.displayName}
                        </h4>
                        {!isMobile && (
                          <p className="text-xs opacity-70 mt-1">{game.description}</p>
                        )}
                        <div className={`text-casino-gold/80 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                          {game.discordCommand}
                        </div>
                      </div>
                      <div className="text-casino-gold/60 flex-shrink-0">
                        <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Secondary Discord CTA in Menu */}
              <motion.button
                onClick={handleDiscordClick}
                className="w-full mt-4 bg-casino-red-gradient text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎰 Play Now in Discord
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation - Enhanced */}
      {isMobile && (
        <motion.div
          className="absolute left-4 right-4 pointer-events-auto"
          style={{ 
            bottom: screenSize === 'xs' ? '5rem' : '6rem',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-casino-black/95 backdrop-blur-md border border-casino-gold/30 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-casino-white flex-1">
                <h4 className="font-semibold text-sm">High Roller Club</h4>
                <p className="text-xs opacity-70">Premium Discord Casino</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-casino-gold rounded-full animate-pulse"></div>
                  <span className="text-xs text-casino-gold/80">
                    {GAMES.length} Games Available
                  </span>
                </div>
              </div>
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-casino-gold/20 border border-casino-gold/40 rounded-lg p-3 text-casino-gold min-w-[48px] min-h-[48px] flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Game Info Badge */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            className="absolute top-6 left-6 pointer-events-auto"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-casino-black/80 backdrop-blur-sm border border-casino-gold/30 rounded-lg p-4 max-w-xs">
              <h4 className="text-casino-gold font-semibold text-sm mb-1">
                {selectedGame.displayName}
              </h4>
              <p className="text-casino-white/80 text-xs mb-2">
                {selectedGame.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedGame.features.filter(f => f.highlight).map((feature) => (
                  <span
                    key={feature.title}
                    className="bg-casino-gold/20 text-casino-gold text-xs px-2 py-1 rounded"
                  >
                    {feature.title}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }
      `}</style>
    </div>
  );
}