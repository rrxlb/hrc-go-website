'use client';

import { motion } from 'framer-motion';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';

interface MobileOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function MobileOptimizedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false
}: MobileOptimizedButtonProps) {
  const capabilities = useDeviceCapabilities();

  // Size configurations optimized for touch
  const sizeClasses = {
    sm: capabilities.isMobile ? 'px-4 py-3 text-sm min-h-[44px]' : 'px-3 py-2 text-sm min-h-[36px]',
    md: capabilities.isMobile ? 'px-6 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base min-h-[40px]',
    lg: capabilities.isMobile ? 'px-8 py-4 text-lg min-h-[52px]' : 'px-6 py-3 text-lg min-h-[44px]',
    xl: capabilities.isMobile ? 'px-10 py-5 text-xl min-h-[56px]' : 'px-8 py-4 text-xl min-h-[48px]'
  };

  // Variant styles
  const variantClasses = {
    primary: `
      bg-casino-gold-gradient text-casino-black font-bold 
      shadow-casino-glow hover:shadow-lg active:shadow-md
      border border-casino-gold/20
    `,
    secondary: `
      bg-casino-black/80 text-casino-gold font-semibold 
      border border-casino-gold/30 hover:border-casino-gold/60 
      hover:bg-casino-gold/10 active:bg-casino-gold/20
    `,
    ghost: `
      bg-transparent text-casino-gold font-medium 
      border border-transparent hover:border-casino-gold/30 
      hover:bg-casino-gold/10 active:bg-casino-gold/20
    `
  };

  // Mobile-specific optimizations
  const mobileOptimizations = capabilities.isMobile ? `
    touch-manipulation select-none
    active:scale-95 transition-transform duration-100
  ` : '';

  const baseClasses = `
    inline-flex items-center justify-center rounded-lg 
    transition-all duration-300 font-medium
    focus:outline-none focus:ring-2 focus:ring-casino-gold/50 focus:ring-offset-2 focus:ring-offset-casino-black
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fullWidth ? 'w-full' : ''}
    ${mobileOptimizations}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  const handleClick = () => {
    if (disabled || loading) return;
    
    // Haptic feedback on mobile
    if (capabilities.isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.();
  };

  return (
    <motion.button
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: capabilities.isMobile ? 1.02 : 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      transition={{ duration: 0.1 }}
    >
      {loading && (
        <motion.div
          className="mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>
      )}
      {children}
    </motion.button>
  );
}

// Specialized mobile button variants
export function MobileMenuButton({ 
  isOpen, 
  onClick, 
  className = '' 
}: { 
  isOpen: boolean; 
  onClick: () => void; 
  className?: string; 
}) {
  const capabilities = useDeviceCapabilities();
  
  return (
    <MobileOptimizedButton
      onClick={onClick}
      variant="secondary"
      size={capabilities.screenSize === 'xs' ? 'md' : 'lg'}
      className={`rounded-full ${className}`}
    >
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </motion.div>
    </MobileOptimizedButton>
  );
}

export function MobileDiscordButton({ 
  onClick, 
  className = '' 
}: { 
  onClick: () => void; 
  className?: string; 
}) {
  const capabilities = useDeviceCapabilities();
  
  return (
    <MobileOptimizedButton
      onClick={onClick}
      variant="primary"
      size={capabilities.screenSize === 'xs' ? 'md' : 'lg'}
      className={className}
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
      {capabilities.screenSize === 'xs' ? 'Join' : 'Join Discord'}
    </MobileOptimizedButton>
  );
}