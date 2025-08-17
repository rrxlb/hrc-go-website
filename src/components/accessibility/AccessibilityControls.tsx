'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilityContext } from './AccessibilityProvider';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';

interface AccessibilityControlsProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function AccessibilityControls({ 
  className = '',
  position = 'top-left'
}: AccessibilityControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const accessibility = useAccessibilityContext();
  
  const { containerRef } = useKeyboardNavigation({
    enabled: accessibility.keyboardNavigation,
    trapFocus: isOpen,
    onEscape: () => setIsOpen(false)
  });

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const controls = [
    {
      key: 'reduceMotion',
      label: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: '🎭',
      active: accessibility.reduceMotion || accessibility.prefersReducedMotion,
      toggle: accessibility.toggleReduceMotion,
      disabled: accessibility.prefersReducedMotion
    },
    {
      key: 'highContrast',
      label: 'High Contrast',
      description: 'Increase color contrast for better visibility',
      icon: '🌓',
      active: accessibility.highContrast || accessibility.prefersHighContrast,
      toggle: accessibility.toggleHighContrast,
      disabled: accessibility.prefersHighContrast
    },
    {
      key: 'keyboardNavigation',
      label: 'Keyboard Navigation',
      description: 'Enable enhanced keyboard navigation',
      icon: '⌨️',
      active: accessibility.keyboardNavigation,
      toggle: accessibility.toggleKeyboardNavigation
    },
    {
      key: 'screenReaderMode',
      label: 'Screen Reader Mode',
      description: 'Optimize for screen readers',
      icon: '🔊',
      active: accessibility.screenReaderMode,
      toggle: accessibility.toggleScreenReaderMode
    },
    {
      key: 'focusVisible',
      label: 'Focus Indicators',
      description: 'Show focus indicators for interactive elements',
      icon: '🎯',
      active: accessibility.focusVisible,
      toggle: accessibility.toggleFocusVisible
    }
  ];

  return (
    <div 
      className={`fixed z-50 ${positionClasses[position]} ${className}`}
      ref={containerRef as React.RefObject<HTMLDivElement>}
    >
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="
          bg-casino-black/90 backdrop-blur-sm border border-casino-gold/30 
          rounded-full p-3 text-casino-gold hover:border-casino-gold/60 
          hover:bg-casino-black transition-all duration-300 shadow-casino-glow
          focus:outline-none focus:ring-2 focus:ring-casino-gold/50 focus:ring-offset-2 focus:ring-offset-casino-black
          min-h-[48px] min-w-[48px] flex items-center justify-center
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Accessibility Controls"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" 
            />
          </svg>
        </motion.div>
      </motion.button>

      {/* Controls Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="accessibility-panel"
            className="
              absolute mt-2 w-80 bg-casino-black/95 backdrop-blur-md 
              border border-casino-gold/30 rounded-2xl shadow-2xl p-4
              max-h-96 overflow-y-auto
            "
            style={{
              [position.includes('right') ? 'right' : 'left']: 0,
              [position.includes('top') ? 'top' : 'bottom']: '100%'
            }}
            initial={{ opacity: 0, scale: 0.8, y: position.includes('top') ? -20 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: position.includes('top') ? -20 : 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-labelledby="accessibility-title"
            aria-describedby="accessibility-description"
          >
            <div className="mb-4">
              <h3 
                id="accessibility-title"
                className="text-casino-gold font-bold text-lg"
              >
                Accessibility Settings
              </h3>
              <p 
                id="accessibility-description"
                className="text-casino-white/70 text-sm mt-1"
              >
                Customize your experience for better accessibility
              </p>
            </div>

            <div className="space-y-3">
              {controls.map((control, index) => (
                <motion.div
                  key={control.key}
                  className="
                    flex items-center justify-between p-3 rounded-lg 
                    bg-casino-black/50 border border-casino-gold/20
                    hover:border-casino-gold/40 transition-all duration-300
                  "
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span 
                      className="text-lg flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      {control.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-casino-white font-medium text-sm">
                        {control.label}
                        {control.disabled && (
                          <span className="text-casino-gold/60 text-xs ml-2">
                            (System Setting)
                          </span>
                        )}
                      </h4>
                      <p className="text-casino-white/60 text-xs mt-1">
                        {control.description}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={control.toggle}
                    disabled={control.disabled}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full 
                      transition-colors duration-300 focus:outline-none 
                      focus:ring-2 focus:ring-casino-gold/50 focus:ring-offset-2 
                      focus:ring-offset-casino-black flex-shrink-0
                      ${control.active 
                        ? 'bg-casino-gold' 
                        : 'bg-casino-white/20'
                      }
                      ${control.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
                      }
                    `}
                    role="switch"
                    aria-checked={control.active}
                    aria-labelledby={`${control.key}-label`}
                    aria-describedby={`${control.key}-description`}
                  >
                    <span className="sr-only">
                      {control.active ? 'Disable' : 'Enable'} {control.label}
                    </span>
                    <motion.span
                      className={`
                        inline-block h-4 w-4 rounded-full bg-white shadow-lg 
                        transform transition-transform duration-300
                        ${control.active ? 'translate-x-6' : 'translate-x-1'}
                      `}
                      animate={{ x: control.active ? 24 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Status Indicators */}
            <div className="mt-4 pt-3 border-t border-casino-gold/20">
              <div className="flex items-center gap-2 text-xs text-casino-white/60">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    accessibility.isKeyboardUser ? 'bg-casino-gold' : 'bg-casino-white/30'
                  }`} />
                  <span>Keyboard User</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    accessibility.prefersReducedMotion ? 'bg-casino-gold' : 'bg-casino-white/30'
                  }`} />
                  <span>System: Reduced Motion</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    accessibility.prefersHighContrast ? 'bg-casino-gold' : 'bg-casino-white/30'
                  }`} />
                  <span>System: High Contrast</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}