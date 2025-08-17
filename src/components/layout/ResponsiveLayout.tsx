'use client';

import { useEffect, useState } from 'react';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveLayout({ 
  children, 
  className = '' 
}: ResponsiveLayoutProps) {
  const capabilities = useDeviceCapabilities();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // SSR fallback - render with desktop defaults
    return (
      <div className={`min-h-screen bg-casino-dark ${className}`}>
        {children}
      </div>
    );
  }

  const layoutClasses = [
    'min-h-screen bg-casino-dark transition-all duration-300',
    // Screen size specific classes
    capabilities.screenSize === 'xs' && 'text-sm',
    capabilities.screenSize === 'sm' && 'text-sm',
    capabilities.screenSize === 'md' && 'text-base',
    capabilities.screenSize === 'lg' && 'text-base',
    capabilities.screenSize === 'xl' && 'text-lg',
    capabilities.screenSize === '2xl' && 'text-lg',
    capabilities.screenSize === '3xl' && 'text-xl',
    // Device type specific classes
    capabilities.isMobile && 'mobile-layout',
    capabilities.isTablet && 'tablet-layout',
    capabilities.isDesktop && 'desktop-layout',
    // Touch optimization
    capabilities.hasTouch && 'touch-optimized',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {/* Combined responsive layout styles */}
      <style jsx global>{`
        /* Mobile-specific viewport optimizations */
        ${capabilities.isMobile ? `
          @media (max-width: 768px) {
            body {
              -webkit-text-size-adjust: 100%;
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
              overscroll-behavior: none;
              /* Prevent pull-to-refresh */
              overscroll-behavior-y: contain;
            }
            
            /* Prevent zoom on input focus */
            input, select, textarea {
              font-size: 16px !important;
            }
            
            /* Optimize scrolling */
            * {
              -webkit-overflow-scrolling: touch;
            }
            
            /* Improve touch performance */
            button, a, [role="button"] {
              -webkit-tap-highlight-color: rgba(255, 215, 0, 0.2);
              tap-highlight-color: rgba(255, 215, 0, 0.2);
            }
            
            /* Prevent text selection on UI elements */
            .ui-element {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            /* Optimize canvas rendering on mobile */
            canvas {
              touch-action: none;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
          }
          
          /* iPhone X and newer safe area handling */
          @supports (padding: max(0px)) {
            .mobile-layout {
              padding-top: max(env(safe-area-inset-top), 1rem);
              padding-bottom: max(env(safe-area-inset-bottom), 1rem);
              padding-left: max(env(safe-area-inset-left), 1rem);
              padding-right: max(env(safe-area-inset-right), 1rem);
            }
          }
        ` : ''}
        
        /* Responsive layout styles */
        /* Touch-optimized styles */
        ${capabilities.hasTouch ? `
          .touch-optimized {
            /* Larger touch targets */
            button, a, [role="button"] {
              min-height: 44px;
              min-width: 44px;
            }
            
            /* Better touch feedback */
            button:active, a:active, [role="button"]:active {
              transform: scale(0.98);
              transition: transform 0.1s ease;
            }
            
            /* Prevent text selection on touch */
            .no-select {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
          }
        ` : ''}
        
        /* Mobile layout optimizations */
        .mobile-layout {
          /* Optimize for mobile viewport */
          --mobile-vh: 100vh;
        }
        
        @supports (-webkit-touch-callout: none) {
          .mobile-layout {
            /* iOS Safari viewport fix */
            --mobile-vh: -webkit-fill-available;
          }
        }
        
        .mobile-layout .full-height {
          height: var(--mobile-vh);
          min-height: var(--mobile-vh);
        }
        
        /* Tablet optimizations */
        .tablet-layout {
          /* Optimize spacing for tablet */
          --container-padding: 2rem;
        }
        
        /* Desktop optimizations */
        .desktop-layout {
          --container-padding: 3rem;
        }
        
        /* Responsive text scaling with better mobile optimization */
        @media (max-width: 475px) {
          .responsive-text-xs { font-size: 0.75rem; }
          .responsive-text-sm { font-size: 0.875rem; }
          .responsive-text-base { font-size: 1rem; }
          .responsive-text-lg { font-size: 1.125rem; }
          .responsive-text-xl { font-size: 1.125rem; }
          .responsive-text-2xl { font-size: 1.25rem; }
          .responsive-text-3xl { font-size: 1.5rem; }
          .responsive-text-4xl { font-size: 1.875rem; }
          .responsive-text-5xl { font-size: 2.25rem; }
          .responsive-text-6xl { font-size: 2.5rem; }
        }
        
        @media (min-width: 476px) and (max-width: 640px) {
          .responsive-text-xs { font-size: 0.75rem; }
          .responsive-text-sm { font-size: 0.875rem; }
          .responsive-text-base { font-size: 1rem; }
          .responsive-text-lg { font-size: 1.125rem; }
          .responsive-text-xl { font-size: 1.25rem; }
          .responsive-text-2xl { font-size: 1.5rem; }
          .responsive-text-3xl { font-size: 1.875rem; }
          .responsive-text-4xl { font-size: 2.25rem; }
          .responsive-text-5xl { font-size: 3rem; }
          .responsive-text-6xl { font-size: 3.5rem; }
        }
        
        @media (min-width: 641px) and (max-width: 1023px) {
          .responsive-text-xs { font-size: 0.75rem; }
          .responsive-text-sm { font-size: 0.875rem; }
          .responsive-text-base { font-size: 1rem; }
          .responsive-text-lg { font-size: 1.125rem; }
          .responsive-text-xl { font-size: 1.25rem; }
          .responsive-text-2xl { font-size: 1.5rem; }
          .responsive-text-3xl { font-size: 1.875rem; }
          .responsive-text-4xl { font-size: 2.25rem; }
          .responsive-text-5xl { font-size: 3rem; }
          .responsive-text-6xl { font-size: 3.75rem; }
        }
        
        @media (min-width: 1024px) {
          .responsive-text-xs { font-size: 0.75rem; }
          .responsive-text-sm { font-size: 0.875rem; }
          .responsive-text-base { font-size: 1rem; }
          .responsive-text-lg { font-size: 1.125rem; }
          .responsive-text-xl { font-size: 1.25rem; }
          .responsive-text-2xl { font-size: 1.5rem; }
          .responsive-text-3xl { font-size: 1.875rem; }
          .responsive-text-4xl { font-size: 2.25rem; }
          .responsive-text-5xl { font-size: 3rem; }
          .responsive-text-6xl { font-size: 3.75rem; }
        }
        
        /* Responsive spacing */
        .responsive-p-4 { padding: 1rem; }
        .responsive-p-6 { padding: 1.5rem; }
        .responsive-p-8 { padding: 2rem; }
        
        @media (max-width: 640px) {
          .responsive-p-4 { padding: 0.75rem; }
          .responsive-p-6 { padding: 1rem; }
          .responsive-p-8 { padding: 1.5rem; }
        }
        
        /* Responsive grid with mobile optimization */
        .responsive-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        
        @media (min-width: 475px) {
          .responsive-grid { gap: 1.25rem; }
        }
        
        @media (min-width: 640px) {
          .responsive-grid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        
        @media (min-width: 768px) {
          .responsive-grid { gap: 1.75rem; }
        }
        
        @media (min-width: 1024px) {
          .responsive-grid { 
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
        }
        
        @media (min-width: 1280px) {
          .responsive-grid { 
            grid-template-columns: repeat(4, 1fr);
            gap: 2.5rem;
          }
        }
        
        /* Mobile-specific grid layouts */
        .mobile-grid-1 { grid-template-columns: 1fr; }
        .mobile-grid-2 { grid-template-columns: repeat(2, 1fr); }
        
        @media (max-width: 475px) {
          .mobile-grid-auto {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
        
        /* Touch-optimized elements */
        .touch-optimized .interactive-element {
          min-height: 44px;
          min-width: 44px;
          padding: 0.75rem;
        }
        
        .touch-optimized .button-large {
          min-height: 48px;
          padding: 0.875rem 1.5rem;
        }
        
        .touch-optimized .button-xl {
          min-height: 56px;
          padding: 1rem 2rem;
        }
      `}</style>
      
      {children}
    </div>
  );
}

// Responsive container component
export function ResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = 'max-w-7xl'
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={`
      ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 
      responsive-p-4 sm:responsive-p-6 lg:responsive-p-8
      ${className}
    `}>
      {children}
    </div>
  );
}

// Responsive grid component
export function ResponsiveGrid({ 
  children, 
  className = '',
  columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }
}: {
  children: React.ReactNode;
  className?: string;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}) {
  const gridClasses = [
    'grid gap-4 sm:gap-6',
    `grid-cols-${columns.xs || 1}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}