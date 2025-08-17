'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vector3 } from 'three';
import { useCameraController } from '@/lib/hooks/useCameraController';

interface MobileCameraControlsProps {
  enabled?: boolean;
  onCameraMove?: (direction: Vector3) => void;
  className?: string;
}

export default function MobileCameraControls({
  enabled = true,
  onCameraMove,
  className = ''
}: MobileCameraControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const { navigateToPosition } = useCameraController();

  // Show controls after a delay to not overwhelm users
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Touch gesture handlers with improved sensitivity and momentum
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
    
    // Provide haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !isDragging || !touchStartRef.current || e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Improved sensitivity calculation based on screen size
    const screenWidth = window.innerWidth;
    const sensitivity = screenWidth < 400 ? 0.015 : screenWidth < 600 ? 0.012 : 0.01;

    // Convert touch movement to camera direction with momentum
    const direction = new Vector3(
      deltaX * sensitivity,
      -deltaY * sensitivity,
      0
    );

    onCameraMove?.(direction);
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enabled, isDragging, onCameraMove]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchStartRef.current = null;
    
    // Light haptic feedback on release
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, []);

  // Quick navigation buttons
  const quickNavButtons = [
    { id: 'overview', label: 'Overview', icon: '🏛️' },
    { id: 'default', label: 'Center', icon: '🎯' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`fixed bottom-4 left-4 right-4 z-30 ${className}`}
        >
          {/* Touch Control Area */}
          <div className="mb-4">
            <motion.div
              className={`
                bg-casino-black/80 backdrop-blur-sm border border-casino-gold/30 
                rounded-2xl p-4 mx-auto max-w-sm
                ${isDragging ? 'border-casino-gold/60 bg-casino-gold/10' : ''}
              `}
              whileHover={{ scale: 1.02 }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="text-center mb-2">
                <p className="text-casino-gold text-sm font-medium">
                  Touch & Drag to Look Around
                </p>
                <p className="text-casino-gold/60 text-xs">
                  Swipe to explore the casino
                </p>
              </div>
              
              {/* Visual touch indicator */}
              <div className="relative h-16 bg-casino-black/30 rounded-lg border border-casino-gold/20 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-casino-gold/10"
                  animate={{
                    opacity: isDragging ? 0.3 : 0.1,
                    scale: isDragging ? 1.05 : 1
                  }}
                  transition={{ duration: 0.2 }}
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-8 h-8 bg-casino-gold/30 rounded-full border border-casino-gold/50"
                    animate={{
                      scale: isDragging ? 1.2 : 1,
                      boxShadow: isDragging 
                        ? '0 0 20px rgba(255, 215, 0, 0.4)' 
                        : '0 0 10px rgba(255, 215, 0, 0.2)'
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                
                {/* Directional indicators */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-casino-gold/40 text-xs">
                  ↑
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-casino-gold/40 text-xs">
                  ↓
                </div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-casino-gold/40 text-xs">
                  ←
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-casino-gold/40 text-xs">
                  →
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Navigation */}
          <div className="flex gap-2 justify-center">
            {quickNavButtons.map((button) => (
              <motion.button
                key={button.id}
                onClick={() => navigateToPosition(button.id as any)}
                className="
                  bg-casino-black/80 backdrop-blur-sm border border-casino-gold/30 
                  rounded-xl px-4 py-2 text-casino-gold hover:border-casino-gold/60 
                  hover:bg-casino-gold/10 transition-all duration-300 flex items-center gap-2
                "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{button.icon}</span>
                <span className="text-sm font-medium">{button.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Instruction hint */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 5, duration: 2 }}
            className="text-center mt-2"
          >
            <p className="text-casino-gold/50 text-xs">
              Tap the menu button (top right) to select games
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}