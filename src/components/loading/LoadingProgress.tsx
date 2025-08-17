'use client';

import { motion } from 'framer-motion';

interface LoadingProgressProps {
  progress: number; // 0-100
  currentAsset?: string;
}

export default function LoadingProgress({ progress, currentAsset }: LoadingProgressProps) {
  return (
    <div className="w-full">
      {/* Current asset being loaded */}
      {currentAsset && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-casino-white/60 text-sm mb-4 text-center"
        >
          Loading {currentAsset}...
        </motion.div>
      )}

      {/* Progress bar container */}
      <div className="relative w-full h-2 bg-casino-black/50 rounded-full overflow-hidden border border-casino-gold/20">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-casino-gold/10 to-transparent" />
        
        {/* Progress fill */}
        <motion.div
          className="h-full bg-gradient-to-r from-casino-gold via-yellow-400 to-casino-gold relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: 0.5, 
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* Progress indicator dot */}
        <motion.div
          className="absolute top-1/2 w-3 h-3 bg-casino-gold rounded-full shadow-lg transform -translate-y-1/2"
          animate={{ 
            left: `${Math.max(0, progress - 1)}%`,
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 bg-casino-gold rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>

      {/* Progress percentage */}
      <motion.div
        className="text-casino-gold text-sm font-medium text-center mt-3"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {Math.round(progress)}%
      </motion.div>

      {/* Loading stages indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {[
          { label: '3D Models', threshold: 25 },
          { label: 'Textures', threshold: 50 },
          { label: 'Animations', threshold: 75 },
          { label: 'Ready', threshold: 100 },
        ].map((stage, index) => (
          <motion.div
            key={stage.label}
            className={`flex flex-col items-center space-y-1 ${
              progress >= stage.threshold 
                ? 'text-casino-gold' 
                : 'text-casino-white/30'
            }`}
            animate={{
              scale: progress >= stage.threshold ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
          >
            <div 
              className={`w-2 h-2 rounded-full ${
                progress >= stage.threshold 
                  ? 'bg-casino-gold shadow-casino-glow' 
                  : 'bg-casino-white/20'
              }`}
            />
            <span className="text-xs">{stage.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}