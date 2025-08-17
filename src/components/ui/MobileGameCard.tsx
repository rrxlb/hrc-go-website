'use client';

import { motion } from 'framer-motion';
import { GameConfig } from '@/lib/types';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';
import MobileOptimizedButton from './MobileOptimizedButton';

interface MobileGameCardProps {
  game: GameConfig;
  isSelected?: boolean;
  onSelect?: (gameId: string) => void;
  onPlayNow?: (gameId: string) => void;
  index?: number;
  compact?: boolean;
}

export default function MobileGameCard({
  game,
  isSelected = false,
  onSelect,
  onPlayNow,
  index = 0,
  compact = false
}: MobileGameCardProps) {
  const capabilities = useDeviceCapabilities();

  const handleSelect = () => {
    onSelect?.(game.id);
  };

  const handlePlayNow = () => {
    onPlayNow?.(game.id);
  };

  // Responsive sizing based on device
  const cardClasses = `
    relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
    ${capabilities.isMobile ? 'min-h-[120px]' : 'min-h-[140px]'}
    ${compact && capabilities.screenSize === 'xs' ? 'min-h-[100px]' : ''}
    ${isSelected 
      ? 'border-casino-gold/60 bg-casino-gold/10 shadow-casino-glow' 
      : 'border-casino-gold/20 bg-casino-black/50 hover:border-casino-gold/40 hover:bg-casino-gold/5'
    }
  `;

  const textSizes = {
    title: capabilities.screenSize === 'xs' ? 'text-base' : 'text-lg',
    description: capabilities.screenSize === 'xs' ? 'text-xs' : 'text-sm',
    command: capabilities.screenSize === 'xs' ? 'text-xs' : 'text-xs'
  };

  const padding = capabilities.screenSize === 'xs' ? 'p-3' : 'p-4';

  return (
    <motion.div
      className={cardClasses}
      onClick={handleSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={!capabilities.isMobile ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-casino-gold/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className={`relative z-10 ${padding} flex flex-col h-full`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold text-casino-gold ${textSizes.title} leading-tight`}>
            {game.displayName}
          </h3>
          
          {/* Selection indicator */}
          {isSelected && (
            <motion.div
              className="w-6 h-6 bg-casino-gold rounded-full flex items-center justify-center flex-shrink-0 ml-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <svg className="w-4 h-4 text-casino-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </div>

        {/* Description */}
        <p className={`text-casino-white/70 mb-3 flex-1 ${textSizes.description} leading-relaxed`}>
          {compact && capabilities.screenSize === 'xs' 
            ? `${game.description.slice(0, 50)}...`
            : game.description
          }
        </p>

        {/* Features (only on larger screens or when not compact) */}
        {(!compact || capabilities.screenSize !== 'xs') && game.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {game.features.filter(f => f.highlight).slice(0, capabilities.screenSize === 'xs' ? 2 : 3).map((feature) => (
                <span
                  key={feature.title}
                  className={`
                    bg-casino-gold/20 text-casino-gold rounded-full px-2 py-1 
                    ${capabilities.screenSize === 'xs' ? 'text-xs' : 'text-xs'}
                  `}
                >
                  {feature.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className={`text-casino-gold/80 font-mono ${textSizes.command}`}>
            {game.discordCommand}
          </div>
          
          {/* Play Now Button */}
          {capabilities.screenSize !== 'xs' && (
            <MobileOptimizedButton
              onClick={handlePlayNow}
              variant="ghost"
              size="sm"
              className="ml-2"
            >
              Play Now
            </MobileOptimizedButton>
          )}
        </div>

        {/* Mobile Play Now Button (full width on xs screens) */}
        {capabilities.screenSize === 'xs' && (
          <div className="mt-2">
            <MobileOptimizedButton
              onClick={handlePlayNow}
              variant="secondary"
              size="sm"
              fullWidth
            >
              Play in Discord
            </MobileOptimizedButton>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-casino-gold/5 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}

// Compact version for mobile lists
export function CompactGameCard({
  game,
  isSelected = false,
  onSelect,
  onPlayNow,
  index = 0
}: MobileGameCardProps) {
  const capabilities = useDeviceCapabilities();

  return (
    <motion.div
      className={`
        flex items-center p-3 rounded-lg border transition-all duration-300 cursor-pointer
        min-h-[60px] ${capabilities.hasTouch ? 'active:scale-98' : ''}
        ${isSelected 
          ? 'border-casino-gold/60 bg-casino-gold/10' 
          : 'border-casino-gold/20 bg-casino-black/50 hover:border-casino-gold/40'
        }
      `}
      onClick={() => onSelect?.(game.id)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-casino-gold text-sm truncate">
          {game.displayName}
        </h4>
        <p className="text-casino-white/60 text-xs truncate">
          {game.discordCommand}
        </p>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {isSelected && (
          <div className="w-5 h-5 bg-casino-gold rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-casino-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        <svg className="w-4 h-4 text-casino-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}