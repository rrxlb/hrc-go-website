'use client';

import { motion } from 'framer-motion';

export default function SpinningChips() {
  const chipColors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-casino-gold',
    'bg-purple-500'
  ];

  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Central spinning chip stack */}
      <div className="absolute inset-0 flex items-center justify-center">
        {chipColors.map((color, index) => (
          <motion.div
            key={index}
            className={`absolute w-16 h-4 ${color} rounded-full shadow-lg`}
            style={{
              zIndex: chipColors.length - index,
              transformOrigin: 'center',
            }}
            animate={{
              rotateY: [0, 360],
              y: [0, -2, 0],
            }}
            transition={{
              rotateY: {
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
                delay: index * 0.1,
              },
              y: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2,
              },
            }}
          />
        ))}
      </div>

      {/* Orbiting chips */}
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={`orbit-${index}`}
          className="absolute w-8 h-2 bg-casino-gold rounded-full shadow-md"
          style={{
            transformOrigin: '64px 64px', // Center of the container
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3 + index * 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          initial={{
            x: 56, // Position on the orbit circle
            y: 62,
            rotate: index * 120, // Distribute evenly around circle
          }}
        />
      ))}

      {/* Glowing effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-casino-gold/20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Sparkle effects */}
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={`sparkle-${index}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}