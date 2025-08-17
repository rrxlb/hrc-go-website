'use client';

import { motion } from 'framer-motion';
import { GAMES } from '@/lib/data/games';
import { DiscordCTAPresets } from '@/components/ui/DiscordCTA';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';

interface FallbackExperienceProps {
  reason?: 'webgl' | 'performance' | 'error' | 'timeout';
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export default function FallbackExperience({ 
  reason = 'webgl', 
  onRetry,
  showRetryButton = false 
}: FallbackExperienceProps) {
  const capabilities = useDeviceCapabilities();

  const getMessage = () => {
    switch (reason) {
      case 'webgl':
        return 'Your device doesn\'t support 3D graphics, but you can still explore our games!';
      case 'performance':
        return 'We\'ve optimized the experience for your device. Enjoy the games!';
      case 'error':
        return 'We encountered an issue with 3D rendering, but the casino is still open!';
      case 'timeout':
        return 'Loading is taking longer than expected. Here\'s the full casino experience!';
      default:
        return 'Welcome to the High Roller Club!';
    }
  };

  const getIcon = () => {
    switch (reason) {
      case 'webgl':
        return '🖥️';
      case 'performance':
        return '⚡';
      case 'error':
        return '🔧';
      case 'timeout':
        return '⏱️';
      default:
        return '🎰';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-black via-casino-dark to-black">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('/patterns/casino-pattern.svg')] opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-casino-gold-gradient bg-clip-text text-transparent mb-4">
            High Roller Club
          </h1>
          <p className="text-casino-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-4">
            Experience the ultimate AI-powered casino in Discord
          </p>
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-3">{getIcon()}</span>
            <p className="text-casino-white/60 text-sm">
              {getMessage()}
            </p>
          </div>
          
          {showRetryButton && onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-casino-gold text-casino-black rounded-lg hover:bg-casino-gold/90 transition-colors text-sm font-medium mb-4"
            >
              Try 3D Experience Again
            </button>
          )}
        </motion.div>

        {/* Games Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-casino-black/50 border border-casino-gold/20 rounded-lg p-6 hover:border-casino-gold/50 transition-all duration-300 hover:shadow-casino-glow group"
            >
              {/* Game Icon */}
              <div className="w-12 h-12 bg-casino-gold/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-casino-gold/30 transition-colors">
                <span className="text-2xl">
                  {game.id === 'blackjack' && '🃏'}
                  {game.id === 'three-card-poker' && '🎴'}
                  {game.id === 'roulette' && '🎰'}
                  {game.id === 'slots' && '🎲'}
                  {game.id === 'craps' && '🎯'}
                  {game.id === 'higher-or-lower' && '📈'}
                  {game.id === 'horse-racing' && '🏇'}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-casino-gold mb-2">
                {game.displayName}
              </h3>
              
              <p className="text-casino-white/70 text-sm mb-4 line-clamp-3">
                {game.description}
              </p>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {game.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center text-xs text-casino-white/60">
                    <div className="w-1 h-1 bg-casino-gold rounded-full mr-2" />
                    {feature.title}
                  </div>
                ))}
              </div>

              {/* Discord Command */}
              <div className="text-xs text-casino-gold/80 font-mono bg-casino-black/30 px-2 py-1 rounded">
                {game.discordCommand}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <DiscordCTAPresets.HeroCTA 
            onClick={() => console.log('Discord CTA clicked')}
            position="center"
            className="mb-6"
          />
          
          <p className="text-casino-white/60 text-sm">
            Join thousands of players in the most exclusive Discord casino
          </p>
        </motion.div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="space-y-2">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="text-casino-gold font-semibold">AI-Powered</h3>
            <p className="text-casino-white/60 text-sm">
              Advanced AI dealers and realistic game mechanics
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-casino-gold font-semibold">Exclusive Club</h3>
            <p className="text-casino-white/60 text-sm">
              VIP treatment and premium gaming experience
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl mb-2">💎</div>
            <h3 className="text-casino-gold font-semibold">Premium Games</h3>
            <p className="text-casino-white/60 text-sm">
              Seven unique games with realistic simulations
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}