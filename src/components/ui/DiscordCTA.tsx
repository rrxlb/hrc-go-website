'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface DiscordCTAProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'floating' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  className?: string;
  showPulse?: boolean;
  animated?: boolean;
}

export default function DiscordCTA({
  onClick,
  variant = 'primary',
  size = 'medium',
  position = 'bottom-right',
  className = '',
  showPulse = true,
  animated = true,
}: DiscordCTAProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    onClick?.();
    // Open Discord invite in new tab
    window.open('https://discord.gg/RK4K8tDsHB', '_blank');
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6';
      case 'bottom-left':
        return 'fixed bottom-6 left-6';
      case 'top-right':
        return 'fixed top-6 right-6';
      case 'top-left':
        return 'fixed top-6 left-6';
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4 text-sm';
      case 'medium':
        return 'py-3 px-6 text-base';
      case 'large':
        return 'py-4 px-8 text-lg';
      default:
        return 'py-3 px-6 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-casino-gold-gradient text-casino-black font-bold shadow-casino-glow hover:shadow-lg';
      case 'secondary':
        return 'bg-casino-red-gradient text-white font-semibold shadow-lg hover:shadow-xl';
      case 'floating':
        return 'bg-casino-black/90 backdrop-blur-sm border border-casino-gold/30 text-casino-gold hover:border-casino-gold/60 hover:bg-casino-black/95 shadow-casino-glow';
      case 'minimal':
        return 'bg-transparent border-2 border-casino-gold text-casino-gold hover:bg-casino-gold hover:text-casino-black';
      default:
        return 'bg-casino-gold-gradient text-casino-black font-bold shadow-casino-glow hover:shadow-lg';
    }
  };

  const discordIcon = (
    <svg className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );

  const buttonContent = (
    <div className="flex items-center gap-2">
      {discordIcon}
      <span>{isMobile ? 'Join' : 'Join Discord'}</span>
      {isHovered && animated && (
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: 3 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      )}
    </div>
  );

  if (!animated) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${getPositionClasses()}
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${className}
          rounded-full transition-all duration-300 z-50
          ${showPulse ? 'animate-pulse-slow' : ''}
        `}
      >
        {buttonContent}
      </button>
    );
  }

  return (
    <motion.div
      className={`${getPositionClasses()} z-50`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
    >
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${className}
          rounded-full transition-all duration-300
          ${showPulse ? 'animate-pulse-slow' : ''}
        `}
        whileHover={{ 
          scale: 1.05,
          boxShadow: variant === 'primary' 
            ? '0 0 30px rgba(255, 215, 0, 0.5)' 
            : '0 0 30px rgba(220, 20, 60, 0.5)'
        }}
        whileTap={{ scale: 0.95 }}
      >
        {buttonContent}
      </motion.button>

      {/* Floating particles effect on hover */}
      {isHovered && animated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-casino-gold rounded-full"
              initial={{ 
                x: Math.random() * 40 - 20, 
                y: Math.random() * 40 - 20,
                opacity: 0 
              }}
              animate={{ 
                x: Math.random() * 80 - 40, 
                y: Math.random() * 80 - 40,
                opacity: [0, 1, 0] 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: i * 0.1 
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Preset configurations for common use cases
export const DiscordCTAPresets = {
  FloatingPrimary: (props: Partial<DiscordCTAProps>) => (
    <DiscordCTA 
      variant="primary" 
      size="medium" 
      position="bottom-right" 
      showPulse={true}
      animated={true}
      {...props} 
    />
  ),
  
  FloatingSecondary: (props: Partial<DiscordCTAProps>) => (
    <DiscordCTA 
      variant="floating" 
      size="medium" 
      position="bottom-left" 
      showPulse={false}
      animated={true}
      {...props} 
    />
  ),
  
  MenuButton: (props: Partial<DiscordCTAProps>) => (
    <DiscordCTA 
      variant="secondary" 
      size="small" 
      showPulse={false}
      animated={false}
      {...props} 
    />
  ),
  
  HeroCTA: (props: Partial<DiscordCTAProps>) => (
    <DiscordCTA 
      variant="primary" 
      size="large" 
      showPulse={true}
      animated={true}
      {...props} 
    />
  ),
};