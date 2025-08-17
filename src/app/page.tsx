'use client';

import { useState, useEffect } from 'react';
import { GAMES } from '@/lib/data/games';
import CasinoSceneWithLoading from '@/components/casino/CasinoSceneWithLoading';
import NavigationOverlay from '@/components/ui/NavigationOverlay';
import { DiscordCTAPresets } from '@/components/ui/DiscordCTA';
import LoadingWrapper from '@/components/loading/LoadingWrapper';
import ResponsiveLayout, { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveLayout';
import MobileCameraControls from '@/components/casino/MobileCameraControls';
import MobileGameCard from '@/components/ui/MobileGameCard';
import { MobileDiscordButton } from '@/components/ui/MobileOptimizedButton';
import { useDeviceCapabilities } from '@/lib/utils/deviceDetection';
import CasinoErrorHandler, { ComponentErrorHandler } from '@/components/error/CasinoErrorHandler';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { KeyboardNavigationProvider } from '@/components/accessibility/KeyboardNavigationProvider';
import AccessibilityControls from '@/components/accessibility/AccessibilityControls';
import { PerformanceTracker } from '@/components/analytics/PerformanceTracker';
import { useUserJourneyTracking } from '@/lib/hooks/useUserJourneyTracking';
import { useConversionTracking } from '@/lib/hooks/useConversionTracking';
import { AnalyticsDiscordCTA } from '@/components/analytics/AnalyticsDiscordCTA';

export default function Home() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const capabilities = useDeviceCapabilities();
  
  // Analytics hooks
  const userJourneyTracking = useUserJourneyTracking({
    pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    pageName: 'home'
  });
  
  const conversionTracking = useConversionTracking({
    source: 'home_page'
  });

  // Track page view on mount
  useEffect(() => {
    userJourneyTracking.trackPageView('home');
    
    // Track discovery of games
    setTimeout(() => {
      userJourneyTracking.trackDiscovery('games_showcase', 'featured_games');
    }, 2000);
  }, []);

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    
    // Track game discovery and interest
    userJourneyTracking.trackDiscovery('game_selection', gameId);
    conversionTracking.trackConversionFunnel('interest', {
      gameId,
      interactionType: 'game_card_click'
    });
    
    console.log(`Selected game: ${gameId}`);
  };

  const handleDiscordClick = () => {
    // Track conversion attempt
    userJourneyTracking.trackConversionAttempt('discord_join', 'hero_cta');
    
    console.log('Discord CTA clicked');
  };

  return (
    <AccessibilityProvider>
      <KeyboardNavigationProvider>
        <CasinoErrorHandler 
          loadingTimeout={15000}
          enableWebGLDetection={true}
          enableTimeoutFallback={true}
        >
          <LoadingWrapper minLoadingTime={2500}>
            <ResponsiveLayout>
              {/* Skip Links for Screen Readers */}
              <a 
                href="#main-content" 
                className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-casino-black focus:text-casino-white focus:px-4 focus:py-2 focus:rounded focus:border-2 focus:border-casino-gold"
              >
                Skip to main content
              </a>
              <a 
                href="#navigation" 
                className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:bg-casino-black focus:text-casino-white focus:px-4 focus:py-2 focus:rounded focus:border-2 focus:border-casino-gold"
              >
                Skip to navigation
              </a>

              {/* Accessibility Controls */}
              <AccessibilityControls position="top-left" />
          {/* 3D Casino Scene Background */}
          <div className="absolute inset-0 z-0">
            <ComponentErrorHandler componentName="CasinoScene">
              <CasinoSceneWithLoading />
              <PerformanceTracker 
                trackingInterval={5000}
                enableMemoryTracking={true}
                enableSceneComplexityTracking={true}
              />
            </ComponentErrorHandler>
          </div>
      
        {/* Navigation Overlay */}
        <ComponentErrorHandler componentName="NavigationOverlay">
          <NavigationOverlay 
            onGameSelect={handleGameSelect}
            onDiscordClick={handleDiscordClick}
          />
        </ComponentErrorHandler>
        
        {/* Mobile Camera Controls */}
        {capabilities.isMobile && (
          <ComponentErrorHandler componentName="MobileCameraControls">
            <MobileCameraControls 
              enabled={true}
              onCameraMove={(direction) => {
                console.log('Mobile camera move:', direction);
              }}
            />
          </ComponentErrorHandler>
        )}
      
        {/* UI Overlay */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center bg-black/20">
          <ResponsiveContainer maxWidth="max-w-6xl">
            <main id="main-content" className="text-center" role="main">
              <h1 className={`
                font-bold mb-6 bg-casino-gold-gradient bg-clip-text text-transparent animate-glow
                ${capabilities.screenSize === 'xs' ? 'text-3xl' : 
                  capabilities.screenSize === 'sm' ? 'text-4xl' :
                  capabilities.screenSize === 'md' ? 'text-5xl' : 'text-6xl'}
              `}>
                High Roller Club
              </h1>
              
              <p className={`
                text-casino-white/80 mb-8 mx-auto leading-relaxed
                ${capabilities.screenSize === 'xs' ? 'text-sm max-w-sm' : 
                  capabilities.screenSize === 'sm' ? 'text-base max-w-md' :
                  'text-xl max-w-2xl'}
              `}>
                Experience the ultimate AI-powered casino in Discord. Join the exclusive High Roller Club 
                for premium games, realistic simulations, and VIP treatment.
              </p>

              <ResponsiveGrid 
                columns={{ 
                  xs: 1, 
                  sm: 2, 
                  md: 2, 
                  lg: 3, 
                  xl: 3 
                }}
                className="mb-12"
              >
                {GAMES.slice(0, capabilities.isMobile ? 4 : 6).map((game, index) => (
                  <MobileGameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGameId === game.id}
                    onSelect={handleGameSelect}
                    onPlayNow={handleDiscordClick}
                    index={index}
                    compact={capabilities.screenSize === 'xs'}
                  />
                ))}
              </ResponsiveGrid>

              <div className="space-y-4">
                {capabilities.isMobile ? (
                  <AnalyticsDiscordCTA
                    position="hero_mobile"
                    variant="primary"
                    size="large"
                    className="mx-auto"
                  >
                    Join High Roller Club
                  </AnalyticsDiscordCTA>
                ) : (
                  <AnalyticsDiscordCTA
                    position="hero_desktop"
                    variant="primary"
                    size="large"
                    className="relative"
                  >
                    Join High Roller Club on Discord
                  </AnalyticsDiscordCTA>
                )}
                
                {!capabilities.isMobile && (
                  <p className="text-casino-white/60 text-sm">
                    Next.js 14 • TypeScript • Three.js • GSAP • Framer Motion • Tailwind CSS
                  </p>
                )}
              </div>
            </main>
          </ResponsiveContainer>
        </div>
            </ResponsiveLayout>
          </LoadingWrapper>
        </CasinoErrorHandler>
      </KeyboardNavigationProvider>
    </AccessibilityProvider>
  );
}
